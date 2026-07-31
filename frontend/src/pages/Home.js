import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Clock, Dumbbell, Plus, Sprout, Flame, Trophy, ArrowRight } from "lucide-react";
import { LEVELS, getPresetsByLevel } from "../constants/workoutPresets";
import { groupColor } from "../constants/muscleGroups";
import { useAuth } from "../context/AuthContext";
import { listSessions } from "../lib/sessionData";
import { Card, Overline, StatCard } from "../components/ui";
import { cn, fmtNum, formatDate } from "../lib/utils";

const LEVEL_ICONS = { Sprout, Flame, Trophy };
const HERO = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwxfHxkYXJrJTIwZ3ltJTIwd29ya291dCUyMGF0aGxldGUlMjBsaWZ0aW5nJTIwd2VpZ2h0c3xlbnwwfHx8fDE3ODMzMzYwMjh8MA&ixlib=rb-4.1.0&q=85";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [openLevel, setOpenLevel] = useState("principiante");
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    listSessions(isAuthenticated).then((data) => setSessions(data)).catch(() => {});
  }, [isAuthenticated]);

  const stats = useMemo(() => {
    const total = sessions.length;
    const volume = sessions.reduce((a, s) => a + (s.totalVolume || 0), 0);
    const minutes = sessions.reduce((a, s) => a + (s.durationMinutes || 0), 0);
    return { total, volume, minutes };
  }, [sessions]);

  const recent = sessions[0];

  return (
    <div className="animate-fade-up">
      {/* Hero */}
      <Card className="relative mb-8 border-0">
        <div className="absolute inset-0">
          <img src={HERO} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/70 to-bg/30" />
        </div>
        <div className="relative px-6 py-12 sm:py-16 lg:py-20">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-volt" />
            <Overline className="text-volt">Tu diario de hierro</Overline>
          </div>
          <h1 className="font-heading font-bold uppercase tracking-tight leading-none text-5xl sm:text-6xl lg:text-7xl">
            GymTrack<br /><span className="text-volt">Pro</span>
          </h1>
          <p className="text-sub font-sans max-w-md mt-4 mb-6">
            Registra tus entrenos, sigue tu progreso y supera tus récords. Elige un entreno rápido o crea el tuyo.
          </p>
          <button
            onClick={() => navigate("/sesion/nueva")}
            data-testid="start-empty-workout-btn"
            className="bg-volt text-bg font-heading font-bold uppercase tracking-wider px-6 py-3 rounded-lg hover:bg-voltDim active:scale-95 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" strokeWidth={2.6} /> Empezar entreno
          </button>
        </div>
      </Card>

      {/* Stats */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard value={fmtNum(stats.total)} label="Entrenos" testid="home-stat-total" />
          <StatCard value={fmtNum(stats.volume)} label="Kg totales" testid="home-stat-volume" />
          <StatCard value={fmtNum(stats.minutes)} label="Minutos" testid="home-stat-minutes" />
        </div>
      )}

      {/* Recent */}
      {recent && (
        <Card
          className="p-4 mb-8 flex items-center justify-between cursor-pointer hover:border-borderStrong transition-colors"
          onClick={() => navigate(`/sesion/${recent.id}`)}
          data-testid="home-recent-session"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-volt/15 flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5 text-volt" />
            </div>
            <div className="min-w-0">
              <Overline>Último entreno</Overline>
              <p className="font-heading uppercase text-lg truncate">{recent.name}</p>
              <p className="text-sub text-xs font-sans">{formatDate(recent.startedAt)} · {recent.durationMinutes} min</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-muted shrink-0" />
        </Card>
      )}

      {/* Level accordions */}
      <div className="flex items-center gap-2 mb-4">
        <Overline>Entrenos por nivel</Overline>
      </div>
      <div className="flex flex-col gap-4">
        {LEVELS.map((lvl, li) => {
          const Icon = LEVEL_ICONS[lvl.icon] || Dumbbell;
          const presets = getPresetsByLevel(lvl.level);
          const open = openLevel === lvl.level;
          return (
            <Card key={lvl.level} className="animate-fade-up" style={{ animationDelay: `${li * 80}ms` }}>
              <button
                onClick={() => setOpenLevel(open ? null : lvl.level)}
                data-testid={`level-toggle-${lvl.level}`}
                className="w-full flex items-center gap-4 p-4 sm:p-5 text-left"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center border shrink-0"
                  style={{ backgroundColor: lvl.color + "1F", borderColor: lvl.color + "66" }}
                >
                  <Icon className="w-6 h-6" style={{ color: lvl.color }} strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-semibold uppercase text-xl tracking-wide">{lvl.title}</p>
                  <p className="text-sub text-sm font-sans">{lvl.subtitle} · {presets.length} entrenos</p>
                </div>
                <ChevronDown className={cn("w-5 h-5 text-muted transition-transform duration-300", open && "rotate-180")} />
              </button>
              {open && (
                <div className="px-4 sm:px-5 pb-5 grid sm:grid-cols-2 gap-3">
                  {presets.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => navigate(`/sesion/nueva?preset=${p.id}`)}
                      data-testid={`preset-${p.id}`}
                      className="text-left bg-bg border border-border rounded-xl p-4 hover:border-borderStrong active:scale-[0.98] transition-all"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-heading font-semibold uppercase text-lg">{p.name}</p>
                        <span className="flex items-center gap-1 text-xs text-muted font-sans shrink-0">
                          <Clock className="w-3.5 h-3.5" /> {p.estimatedMinutes}′
                        </span>
                      </div>
                      <p className="text-sub text-sm font-sans mb-3 line-clamp-2">{p.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.exercises.slice(0, 5).map((e, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full border"
                            style={{ color: groupColor(e.muscleGroup), borderColor: groupColor(e.muscleGroup) + "55" }}
                          >
                            {e.exerciseName}
                          </span>
                        ))}
                        {p.exercises.length > 5 && (
                          <span className="text-[10px] font-sans text-muted px-1 py-0.5">+{p.exercises.length - 5}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
