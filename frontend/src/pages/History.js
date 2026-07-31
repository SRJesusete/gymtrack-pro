import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, ArrowRight, Clock, Flame } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { listSessions } from "../lib/sessionData";
import { getTypeColor, getTypeLabel } from "../constants/workoutTypes";
import { Card, Overline, Loading } from "../components/ui";
import { GuestBanner } from "../components/GuestBanner";
import { formatDate, fmtNum } from "../lib/utils";

export default function History() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listSessions(isAuthenticated).then((data) => setSessions(data)).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const grouped = useMemo(() => {
    const map = {};
    for (const s of sessions) {
      const key = formatDate(s.startedAt, { month: "long", year: "numeric" });
      (map[key] = map[key] || []).push(s);
    }
    return map;
  }, [sessions]);

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-up">
      <Overline>Registro</Overline>
      <h1 className="font-heading font-bold uppercase text-4xl sm:text-5xl tracking-tight leading-none mt-2 mb-8">Historial</h1>

      {!isAuthenticated && <GuestBanner text="Modo invitado: tu historial se guarda en este dispositivo. Inicia sesión para sincronizarlo." />}

      {sessions.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-3 text-center">
          <Dumbbell className="w-12 h-12 text-border" />
          <p className="text-muted font-sans">Aún no has registrado entrenos.</p>
          <button onClick={() => navigate("/sesion/nueva")} className="text-volt font-sans font-bold uppercase tracking-wide text-sm" data-testid="history-empty-cta">
            Empezar el primero
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([month, list]) => (
          <div key={month} className="mb-8">
            <p className="font-heading uppercase text-sm text-muted tracking-widest mb-3 capitalize">{month}</p>
            <div className="flex flex-col gap-3">
              {list.map((s) => {
                const color = getTypeColor(s.workoutType);
                return (
                  <Card
                    key={s.id}
                    onClick={() => navigate(`/sesion/${s.id}`)}
                    data-testid={`history-session-${s.id}`}
                    className="flex cursor-pointer hover:border-borderStrong transition-colors"
                  >
                    <div className="w-1 shrink-0" style={{ backgroundColor: color }} />
                    <div className="flex-1 p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-sans font-bold uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ color, backgroundColor: color + "22" }}>
                            {getTypeLabel(s.workoutType)}
                          </span>
                          <span className="text-muted text-xs font-sans">{formatDate(s.startedAt)}</span>
                        </div>
                        <p className="font-heading font-semibold uppercase text-lg truncate">{s.name}</p>
                        <div className="flex gap-4 mt-1 text-xs text-sub font-sans">
                          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{s.durationMinutes} min</span>
                          {s.totalVolume > 0 && <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5" />{fmtNum(s.totalVolume)} kg</span>}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted shrink-0" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
