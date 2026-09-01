import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2, X, ChevronLeft, Timer } from "lucide-react";
import { api, apiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { createFullSession } from "../lib/sessionData";
import { getPresetById } from "../constants/workoutPresets";
import { groupColor, MUSCLE_GROUPS } from "../constants/muscleGroups";
import { WORKOUT_TYPES } from "../constants/workoutTypes";
import { Card, Loading, PrimaryButton, Chip } from "../components/ui";
import { Modal } from "../components/Modal";
import { RestTimer } from "../components/RestTimer";

const REST_OPTIONS = [60, 90, 120, 180];
const REST_PREFS_KEY = "gymtrack_rest_prefs";
const restLabel = (s) => (s < 60 ? `${s}s` : `${s / 60} min`);
const loadRestPrefs = () => {
  try { return JSON.parse(localStorage.getItem(REST_PREFS_KEY)) || {}; } catch { return {}; }
};

export default function SessionNew() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [params] = useSearchParams();
  const [name, setName] = useState("Entreno");
  const [workoutType, setWorkoutType] = useState("fuerza");
  const [exs, setExs] = useState([]); // {exerciseId, exerciseName, muscleGroup, sets:[{weight,reps,isWarmup}]}
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pickOpen, setPickOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [restDuration, setRestDuration] = useState(90);
  const [restPrefs, setRestPrefs] = useState(loadRestPrefs);
  const restRef = useRef(null);
  const startRest = (seconds) => restRef.current?.start(seconds);
  const exerciseRest = (exerciseId) => restPrefs[exerciseId] || restDuration;
  const setExerciseRest = (exerciseId, seconds) => {
    setRestPrefs((prev) => {
      const next = { ...prev, [exerciseId]: seconds };
      localStorage.setItem(REST_PREFS_KEY, JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    api.get("/exercises").then(({ data }) => setLibrary(data)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const presetId = params.get("preset");
    const templateId = params.get("template");
    if (presetId) {
      const p = getPresetById(presetId);
      if (p) {
        setName(p.name);
        setExs(p.exercises.map((e) => ({
          exerciseId: e.exerciseId, exerciseName: e.exerciseName, muscleGroup: e.muscleGroup,
          sets: Array.from({ length: e.defaultSets }, () => ({ weight: "", reps: e.defaultReps, isWarmup: false })),
        })));
      }
    } else if (templateId) {
      if (!isAuthenticated) return;
      api.get(`/templates/${templateId}`).then(({ data }) => {
        setName(data.name);
        setExs((data.exercises || []).map((e) => ({
          exerciseId: e.exerciseId, exerciseName: e.exerciseName, muscleGroup: e.muscleGroup,
          sets: Array.from({ length: e.defaultSets || 3 }, () => ({ weight: "", reps: e.defaultReps || 10, isWarmup: false })),
        })));
      }).catch(() => {});
    }
  }, [params]);

  const byGroup = useMemo(() => {
    const map = {};
    for (const ex of library) (map[ex.muscleGroup || "Otros"] = map[ex.muscleGroup || "Otros"] || []).push(ex);
    return map;
  }, [library]);

  const addExercise = (ex) => {
    setExs((prev) => [...prev, { exerciseId: ex.id, exerciseName: ex.name, muscleGroup: ex.muscleGroup, sets: [{ weight: "", reps: 10, isWarmup: false }] }]);
    setPickOpen(false);
  };
  const removeExercise = (i) => setExs((prev) => prev.filter((_, idx) => idx !== i));
  const addSet = (i) => setExs((prev) => prev.map((e, idx) => idx === i ? { ...e, sets: [...e.sets, { weight: "", reps: 10, isWarmup: false }] } : e));
  const removeSet = (i, j) => setExs((prev) => prev.map((e, idx) => idx === i ? { ...e, sets: e.sets.filter((_, sj) => sj !== j) } : e));
  const updateSet = (i, j, field, val) => setExs((prev) => prev.map((e, idx) => idx === i ? { ...e, sets: e.sets.map((s, sj) => sj === j ? { ...s, [field]: val } : s) } : e));

  const totalVolume = useMemo(
    () => exs.reduce((a, e) => a + e.sets.reduce((sa, s) => sa + (parseFloat(s.weight) || 0) * (parseInt(s.reps) || 0), 0), 0),
    [exs]
  );

  const save = async () => {
    if (exs.length === 0) { toast.error("Añade al menos un ejercicio"); return; }
    setSaving(true);
    const payload = {
      name: name.trim() || "Entreno",
      workoutType,
      exercises: exs.map((e) => ({
        exerciseId: e.exerciseId, exerciseName: e.exerciseName, muscleGroup: e.muscleGroup,
        sets: e.sets.map((s) => ({ weight: parseFloat(s.weight) || 0, reps: parseInt(s.reps) || 0, isWarmup: !!s.isWarmup })),
      })),
    };
    try {
      const data = await createFullSession(isAuthenticated, payload);
      if (data.newPrs?.length) toast.success(`¡Nuevo récord! ${data.newPrs.join(", ")}`);
      else toast.success(isAuthenticated ? "Entreno guardado" : "Entreno guardado en este dispositivo");
      navigate(`/sesion/${data.id}`);
    } catch (e) { toast.error(apiError(e)); } finally { setSaving(false); }
  };

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-up pb-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sub hover:text-txt text-sm font-sans mb-4" data-testid="session-back-btn">
        <ChevronLeft className="w-4 h-4" /> Volver
      </button>

      <input value={name} onChange={(e) => setName(e.target.value)} data-testid="session-name-input"
        className="w-full bg-transparent font-heading font-bold uppercase text-3xl sm:text-4xl tracking-tight text-txt focus:outline-none mb-4" />

      <div className="flex flex-wrap gap-2 mb-6">
        {WORKOUT_TYPES.map((t) => (
          <Chip key={t.id} active={workoutType === t.id} color={t.color} onClick={() => setWorkoutType(t.id)} testid={`session-type-${t.id}`}>{t.label}</Chip>
        ))}
      </div>

      <div className="flex items-center flex-wrap gap-2 mb-6">
        <span className="flex items-center gap-1.5 text-xs font-sans font-bold uppercase tracking-wide text-muted mr-1">
          <Timer className="w-4 h-4 text-volt" /> Descanso por defecto
        </span>
        {REST_OPTIONS.map((s) => (
          <Chip key={s} active={restDuration === s} color="#D4FF00" onClick={() => setRestDuration(s)} testid={`rest-option-${s}`}>
            {restLabel(s)}
          </Chip>
        ))}
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {exs.map((e, i) => {
          const gc = groupColor(e.muscleGroup);
          return (
            <Card key={i} className="flex" data-testid={`session-exercise-${i}`}>
              <div className="w-1 shrink-0" style={{ backgroundColor: gc }} />
              <div className="flex-1 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-heading font-semibold uppercase text-lg">{e.exerciseName}</p>
                    <p className="text-xs font-sans" style={{ color: gc }}>{e.muscleGroup}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex items-center" title="Descanso para este ejercicio">
                      <Timer className={`w-3.5 h-3.5 absolute left-2 pointer-events-none ${restPrefs[e.exerciseId] ? "text-volt" : "text-muted"}`} />
                      <select
                        value={exerciseRest(e.exerciseId)}
                        onChange={(ev) => setExerciseRest(e.exerciseId, parseInt(ev.target.value))}
                        data-testid={`session-ex-rest-${i}`}
                        className={`appearance-none bg-bg border rounded-lg pl-7 pr-2 py-1.5 text-xs font-sans font-bold focus:outline-none focus:border-volt cursor-pointer ${restPrefs[e.exerciseId] ? "border-volt/50 text-volt" : "border-border text-sub"}`}
                      >
                        {REST_OPTIONS.map((s) => (
                          <option key={s} value={s}>{restLabel(s)}</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={() => removeExercise(i)} data-testid={`session-remove-ex-${i}`} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="w-8 text-[10px] font-sans font-bold uppercase text-muted">Set</span>
                  <span className="flex-1 text-[10px] font-sans font-bold uppercase text-muted">Kg</span>
                  <span className="flex-1 text-[10px] font-sans font-bold uppercase text-muted">Reps</span>
                  <span className="w-8" />
                  <span className="w-8" />
                </div>
                <div className="flex flex-col gap-2">
                  {e.sets.map((s, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <span className="w-8 text-center font-heading text-sub">{j + 1}</span>
                      <input type="number" value={s.weight} onChange={(ev) => updateSet(i, j, "weight", ev.target.value)} placeholder="0" data-testid={`session-set-weight-${i}-${j}`}
                        className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-txt text-center focus:outline-none focus:border-volt font-sans" />
                      <input type="number" value={s.reps} onChange={(ev) => updateSet(i, j, "reps", ev.target.value)} placeholder="0" data-testid={`session-set-reps-${i}-${j}`}
                        className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-txt text-center focus:outline-none focus:border-volt font-sans" />
                      <button onClick={() => startRest(exerciseRest(e.exerciseId))} data-testid={`session-set-rest-${i}-${j}`} title={`Iniciar descanso (${restLabel(exerciseRest(e.exerciseId))})`} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-volt hover:bg-volt/10 transition-colors"><Timer className="w-4 h-4" /></button>
                      <button onClick={() => removeSet(i, j)} className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-danger"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <button onClick={() => addSet(i)} data-testid={`session-add-set-${i}`} className="mt-2 flex items-center gap-1 text-volt text-sm font-sans font-bold"><Plus className="w-4 h-4" /> Añadir serie</button>
              </div>
            </Card>
          );
        })}
      </div>

      <button onClick={() => setPickOpen(true)} data-testid="session-add-exercise-btn"
        className="w-full flex items-center justify-center gap-2 border border-dashed border-borderStrong rounded-xl py-4 font-heading uppercase tracking-wide text-sub hover:text-txt hover:border-volt transition-colors mb-6">
        <Plus className="w-5 h-5" /> Añadir ejercicio
      </button>

      <div className="sticky bottom-24 md:bottom-6">
        <PrimaryButton onClick={save} disabled={saving} className="w-full shadow-lg" data-testid="session-save-btn">
          {saving ? "Guardando..." : `Guardar entreno · ${totalVolume.toLocaleString("es-ES")} kg`}
        </PrimaryButton>
      </div>

      <Modal open={pickOpen} onClose={() => setPickOpen(false)} title="Añadir ejercicio" testid="session-picker-modal">
        <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
          {MUSCLE_GROUPS.filter((g) => byGroup[g.key]).map((g) => (
            <div key={g.key}>
              <p className="text-xs font-sans font-bold uppercase tracking-wide mb-2" style={{ color: g.color }}>{g.label}</p>
              <div className="flex flex-col gap-1.5">
                {byGroup[g.key].map((ex) => (
                  <button key={ex.id} onClick={() => addExercise(ex)} data-testid={`session-pick-${ex.id}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border border-border hover:border-volt hover:bg-volt/5 text-left transition-colors">
                    <span className="text-sm font-sans">{ex.name}</span>
                    <Plus className="w-4 h-4 text-volt" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <RestTimer ref={restRef} />
    </div>
  );
}
