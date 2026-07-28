from dotenv import load_dotenv
from pathlib import Path
load_dotenv(Path(__file__).parent / ".env")

import os
import json
import uuid
import bcrypt
import jwt
import httpx
from datetime import datetime, timezone, timedelta
from typing import Optional, List

from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALG = "HS256"
EMERGENT_SESSION_URL = os.environ.get(
    "EMERGENT_SESSION_URL",
    "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
)

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="GymTrack Pro API")
api = APIRouter(prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------- helpers ----------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False


def create_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=7),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def public_user(u: dict) -> dict:
    return {
        "id": u["user_id"],
        "email": u.get("email"),
        "name": u.get("name"),
        "picture": u.get("picture"),
        "authProvider": u.get("auth_provider", "email"),
        "createdAt": u.get("created_at"),
    }


async def get_current_user(request: Request) -> dict:
    token = None
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
    if not token:
        token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sesión expirada")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
    user = await db.users.find_one({"user_id": payload["sub"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return user


# ---------- models ----------
class RegisterReq(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    name: Optional[str] = None


class LoginReq(BaseModel):
    email: EmailStr
    password: str


class GoogleSessionReq(BaseModel):
    session_id: str


class SetIn(BaseModel):
    weight: float = 0
    reps: int = 0
    isWarmup: bool = False


class ExerciseIn(BaseModel):
    exerciseId: str
    exerciseName: str
    muscleGroup: str
    sets: List[SetIn] = []


class SessionCreate(BaseModel):
    name: str
    templateId: Optional[str] = None
    startedAt: Optional[str] = None
    workoutType: Optional[str] = "otro"
    exercises: List[ExerciseIn] = []


class QuickLogReq(BaseModel):
    name: str
    startedAt: str
    durationMinutes: int = 0
    notes: str = ""
    workoutType: Optional[str] = "otro"
    totalVolume: Optional[float] = 0


class SessionUpdate(BaseModel):
    name: Optional[str] = None
    durationMinutes: Optional[int] = None
    notes: Optional[str] = None
    startedAt: Optional[str] = None
    totalVolume: Optional[float] = None
    workoutType: Optional[str] = None


class TemplateExerciseIn(BaseModel):
    exerciseId: str
    exerciseName: str
    muscleGroup: str
    defaultSets: int = 3
    defaultReps: int = 10


class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    exercises: List[TemplateExerciseIn] = []


class UserExerciseCreate(BaseModel):
    name: str
    muscleGroup: str
    category: Optional[str] = "strength"
    description: Optional[str] = ""


# ---------- auth routes ----------
@api.post("/auth/register")
async def register(body: RegisterReq):
    email = body.email.lower().strip()
    if await db.users.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Este email ya está registrado")
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    doc = {
        "user_id": user_id,
        "email": email,
        "name": body.name or email.split("@")[0],
        "picture": None,
        "password_hash": hash_password(body.password),
        "auth_provider": "email",
        "created_at": now_iso(),
    }
    await db.users.insert_one(doc)
    token = create_token(user_id, email)
    return {"token": token, "user": public_user(doc)}


@api.post("/auth/login")
async def login(body: LoginReq):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not user.get("password_hash") or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email o contraseña incorrectos")
    token = create_token(user["user_id"], email)
    return {"token": token, "user": public_user(user)}


@api.post("/auth/google/session")
async def google_session(body: GoogleSessionReq):
    async with httpx.AsyncClient(timeout=15) as hc:
        r = await hc.get(EMERGENT_SESSION_URL, headers={"X-Session-ID": body.session_id})
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="No se pudo validar la sesión de Google")
    data = r.json()
    email = (data.get("email") or "").lower().strip()
    if not email:
        raise HTTPException(status_code=401, detail="Sesión de Google inválida")
    user = await db.users.find_one({"email": email})
    if not user:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user = {
            "user_id": user_id,
            "email": email,
            "name": data.get("name") or email.split("@")[0],
            "picture": data.get("picture"),
            "password_hash": None,
            "auth_provider": "google",
            "created_at": now_iso(),
        }
        await db.users.insert_one(user)
    else:
        await db.users.update_one(
            {"user_id": user["user_id"]},
            {"$set": {"name": data.get("name") or user.get("name"), "picture": data.get("picture") or user.get("picture")}},
        )
        user = await db.users.find_one({"user_id": user["user_id"]}, {"_id": 0})
    token = create_token(user["user_id"], email)
    return {"token": token, "user": public_user(user)}


@api.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return public_user(user)


@api.post("/auth/logout")
async def logout():
    return {"ok": True}


# ---------- exercises (public) ----------
@api.get("/exercises")
async def list_exercises():
    rows = await db.exercises.find({}, {"_id": 0}).sort("name", 1).to_list(1000)
    return rows


# ---------- user exercises ----------
@api.get("/user-exercises")
async def list_user_exercises(user: dict = Depends(get_current_user)):
    rows = await db.user_exercises.find({"user_id": user["user_id"]}, {"_id": 0}).sort("name", 1).to_list(1000)
    return rows


@api.post("/user-exercises")
async def create_user_exercise(body: UserExerciseCreate, user: dict = Depends(get_current_user)):
    doc = {
        "id": f"uex_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "name": body.name,
        "muscleGroup": body.muscleGroup,
        "category": body.category,
        "description": body.description,
    }
    await db.user_exercises.insert_one(doc)
    doc.pop("_id", None)
    return doc


# ---------- templates ----------
@api.get("/templates")
async def list_templates(user: dict = Depends(get_current_user)):
    rows = await db.templates.find({"user_id": user["user_id"]}, {"_id": 0}).sort("createdAt", -1).to_list(1000)
    return rows


@api.get("/templates/{tid}")
async def get_template(tid: str, user: dict = Depends(get_current_user)):
    tpl = await db.templates.find_one({"id": tid, "user_id": user["user_id"]}, {"_id": 0})
    if not tpl:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada")
    return tpl


@api.post("/templates")
async def create_template(body: TemplateCreate, user: dict = Depends(get_current_user)):
    doc = {
        "id": f"tpl_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "name": body.name,
        "description": body.description or "",
        "createdAt": now_iso(),
        "exercises": [
            {**e.model_dump(), "sortOrder": i} for i, e in enumerate(body.exercises)
        ],
    }
    await db.templates.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.delete("/templates/{tid}")
async def delete_template(tid: str, user: dict = Depends(get_current_user)):
    await db.templates.delete_one({"id": tid, "user_id": user["user_id"]})
    return {"ok": True}


# ---------- sessions ----------
@api.get("/sessions")
async def list_sessions(user: dict = Depends(get_current_user)):
    rows = await db.sessions.find({"user_id": user["user_id"]}, {"_id": 0}).sort("startedAt", -1).to_list(2000)
    return rows


@api.get("/sessions/{sid}")
async def get_session(sid: str, user: dict = Depends(get_current_user)):
    s = await db.sessions.find_one({"id": sid, "user_id": user["user_id"]}, {"_id": 0})
    if not s:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    return s


@api.post("/sessions")
async def create_session(body: SessionCreate, user: dict = Depends(get_current_user)):
    uid = user["user_id"]
    sid = f"ses_{uuid.uuid4().hex[:12]}"
    started = body.startedAt or now_iso()
    total_volume = 0.0
    ex_docs = []
    new_prs = []
    for i, ex in enumerate(body.exercises):
        # heaviest working set for this exercise in this session
        max_weight = max((s.weight for s in ex.sets), default=0)
        prev = await db.personal_records.find_one(
            {"user_id": uid, "exerciseId": ex.exerciseId, "prType": "weight"},
            sort=[("prValue", -1)],
        )
        prev_best = prev["prValue"] if prev else 0
        pr_this_exercise = max_weight > prev_best and max_weight > 0
        pr_set_marked = False
        if pr_this_exercise:
            pr = {
                "id": f"pr_{uuid.uuid4().hex[:12]}",
                "user_id": uid,
                "exerciseId": ex.exerciseId,
                "exerciseName": ex.exerciseName,
                "prType": "weight",
                "prValue": max_weight,
                "sessionId": sid,
                "achievedAt": started,
            }
            await db.personal_records.insert_one(pr)
            new_prs.append(ex.exerciseName)
        set_docs = []
        for j, s in enumerate(ex.sets):
            is_pr = False
            if pr_this_exercise and not pr_set_marked and s.weight == max_weight:
                is_pr = True
                pr_set_marked = True
            set_docs.append({
                "setNumber": j + 1,
                "weight": s.weight,
                "reps": s.reps,
                "isPr": is_pr,
                "isWarmup": s.isWarmup,
            })
            total_volume += s.weight * s.reps
        ex_docs.append({
            "exerciseId": ex.exerciseId,
            "exerciseName": ex.exerciseName,
            "muscleGroup": ex.muscleGroup,
            "sortOrder": i,
            "sets": set_docs,
        })
    doc = {
        "id": sid,
        "user_id": uid,
        "templateId": body.templateId,
        "name": body.name,
        "workoutType": body.workoutType or "otro",
        "startedAt": started,
        "completedAt": now_iso(),
        "totalVolume": total_volume,
        "durationMinutes": max(1, len(body.exercises) * 5) if body.exercises else 10,
        "notes": "",
        "exercises": ex_docs,
    }
    await db.sessions.insert_one(doc)
    doc.pop("_id", None)
    return {**doc, "newPrs": new_prs}


@api.post("/sessions/quick")
async def quick_log(body: QuickLogReq, user: dict = Depends(get_current_user)):
    doc = {
        "id": f"ses_{uuid.uuid4().hex[:12]}",
        "user_id": user["user_id"],
        "templateId": None,
        "name": body.name,
        "workoutType": body.workoutType or "otro",
        "startedAt": body.startedAt,
        "completedAt": body.startedAt,
        "totalVolume": body.totalVolume or 0,
        "durationMinutes": body.durationMinutes,
        "notes": body.notes or "",
        "exercises": [],
    }
    await db.sessions.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api.put("/sessions/{sid}")
async def update_session(sid: str, body: SessionUpdate, user: dict = Depends(get_current_user)):
    update = {k: v for k, v in body.model_dump().items() if v is not None}
    if not update:
        raise HTTPException(status_code=400, detail="Nada que actualizar")
    res = await db.sessions.update_one({"id": sid, "user_id": user["user_id"]}, {"$set": update})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Sesión no encontrada")
    s = await db.sessions.find_one({"id": sid, "user_id": user["user_id"]}, {"_id": 0})
    return s


@api.delete("/sessions/{sid}")
async def delete_session(sid: str, user: dict = Depends(get_current_user)):
    await db.sessions.delete_one({"id": sid, "user_id": user["user_id"]})
    return {"ok": True}


# ---------- personal records ----------
@api.get("/personal-records")
async def list_prs(user: dict = Depends(get_current_user)):
    rows = await db.personal_records.find({"user_id": user["user_id"]}, {"_id": 0}).sort("achievedAt", -1).to_list(1000)
    return rows


@api.get("/health")
async def health():
    return {"status": "ok"}


app.include_router(api)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.users.create_index("user_id", unique=True)
    await db.sessions.create_index("user_id")
    await db.templates.create_index("user_id")
    await db.personal_records.create_index("user_id")
    # seed exercises if empty
    count = await db.exercises.count_documents({})
    if count == 0:
        seed_path = Path(__file__).parent / "seed_exercises.json"
        if seed_path.exists():
            data = json.loads(seed_path.read_text())
            exercises = data.get("exercises", data) if isinstance(data, dict) else data
            if exercises:
                await db.exercises.insert_many(exercises)
