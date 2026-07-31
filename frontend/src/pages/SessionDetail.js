import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ChevronLeft, Trash2, Award } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getSession, deleteSession } from "../lib/sessionData";
import { getTypeColor, getTypeLabel } from "../constants/workoutTypes";
import { groupColor } from "../constants/muscleGroups";
import { Card, Overline, Loading, StatCard } from "../components/ui";
import { formatDate, fmtNum } from "../lib/utils";

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.resolve(getSession(isAuthenticated, id))
      .then((data) => setSession(data))
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  const del = async () => {
    await deleteSession(isAuthenticated, id);
    toast.success("Entreno eliminado");
    navigate("/historial");
  };

  if (loading) return <Loading />;
  if (!session) return <p className="text-sub py-16 text-center font-sans">Entreno no encontrado.</p>;

  const color = getTypeColor(session.workoutType);

  return (
    <div className="animate-fade-up">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sub hover:text-txt text-sm font-sans mb-4" data-testid="detail-back-btn">
        <ChevronLeft className="w-4 h-4" /> Volver
      </button>

      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <span className="inline-block text-[10px] font-sans font-bold uppercase tracking-wide px-2 py-0.5 rounded-full mb-2" style={{ color, backgroundColor: color + "22" }}>
            {getTypeLabel(session.workoutType)}
          </span>
          <h1 className="font-heading font-bold uppercase text-3xl sm:text-4xl tracking-tight leading-none">{session.name}</h1>
          <p className="text-sub font-sans mt-1">{formatDate(session.startedAt, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <button onClick={del} data-testid="detail-delete-btn" className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg border border-border text-muted hover:text-danger hover:border-danger transition-colors">
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard value={fmtNum(session.totalVolume)} label="Kg" testid="detail-volume" />
        <StatCard value={session.durationMinutes} label="Minutos" testid="detail-duration" />
        <StatCard value={(session.exercises || []).length} label="Ejercicios" testid="detail-exercises" />
      </div>

      {session.notes && (
        <Card className="p-4 mb-8">
          <Overline>Notas</Overline>
          <p className="text-sub font-sans mt-2">{session.notes}</p>
        </Card>
      )}

      {(session.exercises || []).length > 0 && (
        <div className="flex flex-col gap-4">
          {session.exercises.map((e, i) => {
            const gc = groupColor(e.muscleGroup);
            return (
              <Card key={i} className="flex" data-testid={`detail-exercise-${i}`}>
                <div className="w-1 shrink-0" style={{ backgroundColor: gc }} />
                <div className="flex-1 p-4">
                  <p className="font-heading font-semibold uppercase text-lg">{e.exerciseName}</p>
                  <p className="text-xs font-sans mb-3" style={{ color: gc }}>{e.muscleGroup}</p>
                  <div className="flex flex-col gap-1.5">
                    {(e.sets || []).map((s, j) => (
                      <div key={j} className="flex items-center gap-3 text-sm font-sans">
                        <span className="w-6 font-heading text-muted">{j + 1}</span>
                        <span className="text-txt font-bold">{s.weight} kg × {s.reps}</span>
                        {s.isPr && <span className="flex items-center gap-1 text-volt text-xs font-bold"><Award className="w-3.5 h-3.5" /> PR</span>}
                        {s.isWarmup && <span className="text-muted text-xs">calent.</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
