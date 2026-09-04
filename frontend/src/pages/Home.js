import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronDown, Clock, Dumbbell, Plus, Sprout, Flame, Trophy, ArrowRight, Share2, Download, Target, Check } from "lucide-react";
import { LEVELS, getPresetsByLevel } from "../constants/workoutPresets";
import { groupColor } from "../constants/muscleGroups";
import { useAuth } from "../context/AuthContext";
import { listSessions } from "../lib/sessionData";
import { buildStreakCard, canvasToBlob } from "../lib/shareCard";
import { Card, Overline, StatCard } from "../components/ui";
import { Modal } from "../components/Modal";
import { cn, fmtNum, formatDate } from "../lib/utils";

const LEVEL_ICONS = { Sprout, Flame, Trophy };
const GOAL_KEY = "gymtrack_weekly_goal";
const HERO = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwxfHxkYXJrJTIwZ3ltJTIwd29ya291dCUyMGF0aGxldGUlMjBsaWZ0aW5nJTIwd2VpZ2h0c3xlbnwwfHx8fDE3ODMzMzYwMjh8MA&ixlib=rb-4.1.0&q=85";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [openLevel, setOpenLevel] = useState("principiante");
  const [sessions, setSessions] = useState([]);
  const [shareUrl, setShareUrl] = useState(null);
  const [shareBlob, setShareBlob] = useState(null);
  const [building, setBuilding] = useState(false);
  const [weeklyGoal, setWeeklyGoal] = useState(() => {
    const v = parseInt(localStorage.getItem(GOAL_KEY), 10);
    return v >= 1 && v <= 7 ? v : 3;
  });

  const setGoal = (n) => {
    setWeeklyGoal(n);
    localStorage.setItem(GOAL_KEY, String(n));
  };

  useEffect(() => {
    listSessions(isAuthenticated).then((data) => setSessions(data)).catch(() => {});
  }, [isAuthenticated]);

  const stats = useMemo(() => {
    const total = sessions.length;
    const volume = sessions.reduce((a, s) => a + (s.totalVolume || 0), 0);
    const minutes = sessions.reduce((a, s) => a + (s.durationMinutes || 0), 0);
    return { total, volume, minutes };
  }, [sessions]);

  const streak = useMemo(() => {
    const weekStart = (d) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
      return x.getTime();
    };
    const weeks = new Set(sessions.map((s) => weekStart(new Date(s.startedAt))));
    const now = weekStart(new Date());
    const MS_WEEK = 7 * 24 * 3600 * 1000;
    let count = 0;
    let cursor = weeks.has(now) ? now : now - MS_WEEK;
    while (weeks.has(cursor)) { count++; cursor -= MS_WEEK; }
    const last8 = Array.from({ length: 8 }, (_, i) => weeks.has(now - (7 - i) * MS_WEEK));
    return { count, thisWeek: weeks.has(now), last8 };
  }, [sessions]);

  const daysThisWeek = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const startMs = start.getTime();
    const endMs = startMs + 7 * 24 * 3600 * 1000;
    const days = new Set();
    sessions.forEach((s) => {
      const t = new Date(s.startedAt).getTime();
      if (t >= startMs && t < endMs) {
        const d = new Date(s.startedAt);
        d.setHours(0, 0, 0, 0);
        days.add(d.getTime());
      }
    });
    return days.size;
  }, [sessions]);

  const recent = sessions[0];

  const openShare = async () => {
    setBuilding(true);
    try {
      const canvas = await buildStreakCard({ ...streak, totalWorkouts: sessions.length });
      const blob = await canvasToBlob(canvas);
      if (shareUrl) URL.revokeObjectURL(shareUrl);
      setShareBlob(blob);
      setShareUrl(URL.createObjectURL(blob));
    } catch (e) {
      toast.error("No se pudo generar la imagen");
    } finally {
      setBuilding(false);
    }
  };

  const closeShare = () => {
    if (shareUrl) URL.revokeObjectURL(shareUrl);
    setShareUrl(null);
    setShareBlob(null);
  };

  const doShare = async () => {
    const file = new File([shareBlob], "racha-gymtrack.png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: "Mi racha en GymTrack Pro" });
        return;
      } catch (e) {
        if (e.name === "AbortError") return;
      }
    }
    doDownload();
  };

  const doDownload = () => {
    const a = document.createElement("a");
    a.href = shareUrl;
    a.download = "racha-gymtrack.png";
    a.click();
    toast.success("Imagen descargada");
  };

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

      {/* Weekly goal */}
      {sessions.length > 0 && (() => {
        const met = daysThisWeek >= weeklyGoal;
        return (
          <Card className="p-4 mb-8" data-testid="home-goal-card">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: met ? "rgba(212,255,0,0.15)" : "rgba(161,161,170,0.12)" }}
                >
                  {met ? <Check className="w-5 h-5 text-volt" /> : <Target className="w-5 h-5 text-muted" />}
                </div>
                <div className="min-w-0">
                  <Overline>Meta semanal</Overline>
                  <p className="font-heading uppercase text-lg leading-tight" data-testid="home-goal-progress">
                    {daysThisWeek} de {weeklyGoal} {weeklyGoal === 1 ? "día" : "días"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setGoal(Math.max(1, weeklyGoal - 1))}
                  disabled={weeklyGoal <= 1}
                  data-testid="home-goal-decrease"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-txt hover:border-volt disabled:opacity-40 transition-colors font-heading text-lg"
                >
                  −
                </button>
                <span className="w-6 text-center font-heading text-xl text-volt" data-testid="home-goal-value">{weeklyGoal}</span>
                <button
                  onClick={() => setGoal(Math.min(7, weeklyGoal + 1))}
                  disabled={weeklyGoal >= 7}
                  data-testid="home-goal-increase"
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-txt hover:border-volt disabled:opacity-40 transition-colors font-heading text-lg"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-4" data-testid="home-goal-dots">
              {Array.from({ length: weeklyGoal }, (_, i) => (
                <span
                  key={i}
                  className="flex-1 h-2.5 rounded-full transition-colors"
                  style={{ backgroundColor: i < daysThisWeek ? "#D4FF00" : "#3F3F46" }}
                />
              ))}
            </div>
            <p className="text-sub text-xs font-sans mt-2">
              {met
                ? "¡Meta cumplida esta semana!"
                : `Te ${weeklyGoal - daysThisWeek === 1 ? "queda 1 día" : `quedan ${weeklyGoal - daysThisWeek} días`} para alcanzar tu meta`}
            </p>
          </Card>
        );
      })()}

      {/* Weekly streak */}
      {sessions.length > 0 && (
        <Card className="p-4 mb-8 flex items-center justify-between gap-4" data-testid="home-streak-card">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: streak.count > 0 ? "rgba(212,255,0,0.15)" : "rgba(161,161,170,0.12)" }}
            >
              <Flame className={cn("w-5 h-5", streak.count > 0 ? "text-volt" : "text-muted")} />
            </div>
            <div className="min-w-0">
              <Overline>Racha semanal</Overline>
              <p className="font-heading uppercase text-lg leading-tight" data-testid="home-streak-count">
                {streak.count > 0
                  ? `${streak.count} ${streak.count === 1 ? "semana" : "semanas"} seguidas`
                  : "Sin racha activa"}
              </p>
              <p className="text-sub text-xs font-sans">
                {streak.thisWeek
                  ? "Esta semana ya has entrenado. ¡Sigue así!"
                  : streak.count > 0
                    ? "Entrena esta semana para mantener la racha"
                    : "Entrena esta semana para empezar una racha"}
              </p>
            </div>
          </div>
          <div className="flex items-end gap-3 shrink-0">
            <div className="flex items-end gap-1" data-testid="home-streak-weeks">
              {streak.last8.map((on, i) => (
                <span
                  key={i}
                  className="w-2.5 rounded-full"
                  style={{
                    height: on ? 22 : 10,
                    backgroundColor: on ? "#D4FF00" : "#3F3F46",
                    opacity: i === 7 && !on ? 0.5 : 1,
                  }}
                />
              ))}
            </div>
            <button
              onClick={openShare}
              disabled={building}
              data-testid="home-streak-share-btn"
              title="Compartir racha"
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-volt/40 text-volt hover:bg-volt/10 transition-colors disabled:opacity-50"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </Card>
      )}

      <Modal open={!!shareUrl} onClose={closeShare} title="Compartir racha" testid="streak-share-modal">
        {shareUrl && (
          <div className="flex flex-col gap-4">
            <img src={shareUrl} alt="Resumen de la racha" data-testid="streak-share-preview-img" className="w-full rounded-xl border border-border" />
            <div className="flex gap-3">
              <button onClick={doShare} data-testid="streak-share-confirm-btn" className="flex-1 flex items-center justify-center gap-2 bg-volt text-bg font-heading font-bold uppercase tracking-wider px-4 py-3 rounded-lg hover:bg-voltDim active:scale-95 transition-all">
                <Share2 className="w-5 h-5" /> Compartir
              </button>
              <button onClick={doDownload} data-testid="streak-share-download-btn" className="flex-1 flex items-center justify-center gap-2 border border-border text-txt font-heading font-bold uppercase tracking-wider px-4 py-3 rounded-lg hover:border-volt active:scale-95 transition-all">
                <Download className="w-5 h-5" /> Descargar
              </button>
            </div>
          </div>
        )}
      </Modal>

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
