import React, { useEffect, useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Award, TrendingUp } from "lucide-react";
import { api } from "../lib/api";
import { Card, Overline, Loading, StatCard } from "../components/ui";
import { TypeDistribution } from "../components/TypeDistribution";
import { fmtNum, formatDate } from "../lib/utils";
import { cn } from "../lib/utils";

const RANGES = [
  { id: "month", label: "Mes" },
  { id: "year", label: "Año" },
  { id: "all", label: "Todo" },
];

export default function Progress() {
  const [sessions, setSessions] = useState([]);
  const [prs, setPrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("month");
  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/sessions").then((r) => r.data),
      api.get("/personal-records").then((r) => r.data),
    ]).then(([s, p]) => { setSessions(s); setPrs(p); }).finally(() => setLoading(false));
  }, []);

  const ranged = useMemo(() => {
    const now = new Date();
    let from = new Date(0);
    if (range === "month") from = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (range === "year") from = new Date(now.getFullYear(), 0, 1);
    return sessions.filter((s) => new Date(s.startedAt) >= from);
  }, [sessions, range]);

  const chartSessions = useMemo(
    () => (selectedType ? ranged.filter((s) => (s.workoutType || "otro") === selectedType) : ranged),
    [ranged, selectedType]
  );

  const chartData = useMemo(() => {
    const map = {};
    for (const s of [...chartSessions].sort((a, b) => new Date(a.startedAt) - new Date(b.startedAt))) {
      const key = formatDate(s.startedAt, { day: "2-digit", month: "short" });
      map[key] = (map[key] || 0) + (s.totalVolume || 0);
    }
    return Object.entries(map).map(([date, volume]) => ({ date, volume }));
  }, [chartSessions]);

  const totals = useMemo(() => {
    const volume = ranged.reduce((a, s) => a + (s.totalVolume || 0), 0);
    const minutes = ranged.reduce((a, s) => a + (s.durationMinutes || 0), 0);
    return { count: ranged.length, volume, minutes };
  }, [ranged]);

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-up">
      <Overline>Estadísticas</Overline>
      <h1 className="font-heading font-bold uppercase text-4xl sm:text-5xl tracking-tight leading-none mt-2 mb-6">Progreso</h1>

      <div className="flex gap-2 mb-6">
        {RANGES.map((r) => (
          <button key={r.id} onClick={() => setRange(r.id)} data-testid={`range-${r.id}`}
            className={cn("px-4 py-2 rounded-full text-sm font-heading font-medium uppercase tracking-wide transition-all active:scale-95",
              range === r.id ? "bg-volt text-bg" : "bg-surface border border-border text-sub hover:text-txt")}>
            {r.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard value={fmtNum(totals.count)} label="Entrenos" testid="progress-stat-count" />
        <StatCard value={fmtNum(totals.volume)} label="Kg totales" testid="progress-stat-volume" />
        <StatCard value={fmtNum(totals.minutes)} label="Minutos" testid="progress-stat-minutes" />
      </div>

      <Card className="p-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-volt" />
          <Overline>Volumen a lo largo del tiempo{selectedType ? " (filtrado)" : ""}</Overline>
        </div>
        {chartData.length === 0 ? (
          <p className="text-sub text-sm font-sans py-8 text-center">Sin datos en este periodo.</p>
        ) : (
          <div style={{ width: "100%", height: 220 }} data-testid="progress-volume-chart">
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="volt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4FF00" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#D4FF00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#27272A" vertical={false} />
                <XAxis dataKey="date" stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#141414", border: "1px solid #27272A", borderRadius: 8, fontFamily: "Manrope" }}
                  labelStyle={{ color: "#A1A1AA" }}
                  formatter={(v) => [`${fmtNum(v)} kg`, "Volumen"]}
                />
                <Area type="monotone" dataKey="volume" stroke="#D4FF00" strokeWidth={2.5} fill="url(#volt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <Card className="p-5 mb-8">
        <Overline>Distribución por tipo</Overline>
        <div className="mt-4">
          <TypeDistribution sessions={ranged} metric="volume" selectedType={selectedType} onSelectType={setSelectedType} />
        </div>
      </Card>

      <div className="flex items-center gap-2 mb-4">
        <Award className="w-5 h-5 text-volt" />
        <Overline>Récords personales</Overline>
      </div>
      {prs.length === 0 ? (
        <p className="text-sub text-sm font-sans">Registra entrenos con peso para conseguir récords.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {prs.map((pr) => (
            <Card key={pr.id} className="p-4 flex items-center justify-between" data-testid={`pr-${pr.id}`}>
              <div className="min-w-0">
                <p className="font-heading font-semibold uppercase truncate">{pr.exerciseName}</p>
                <p className="text-muted text-xs font-sans">{formatDate(pr.achievedAt)}</p>
              </div>
              <span className="font-heading text-2xl text-volt shrink-0">{fmtNum(pr.prValue)} kg</span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
