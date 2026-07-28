import React, { useMemo } from "react";
import { getTypeColor, getTypeLabel } from "../constants/workoutTypes";
import { cn } from "../lib/utils";

export function TypeDistribution({ sessions, metric = "minutes", selectedType, onSelectType }) {
  const stats = useMemo(() => {
    const map = {};
    for (const s of sessions) {
      const t = s.workoutType || "otro";
      if (!map[t]) map[t] = { type: t, count: 0, minutes: 0, volume: 0 };
      map[t].count += 1;
      map[t].minutes += s.durationMinutes || 0;
      map[t].volume += s.totalVolume || 0;
    }
    return Object.values(map).sort((a, b) => b[metric] - a[metric]);
  }, [sessions, metric]);

  const max = Math.max(1, ...stats.map((s) => s[metric]));

  if (stats.length === 0)
    return <p className="text-sub text-sm">Sin datos todavía.</p>;

  return (
    <div className="flex flex-col gap-3">
      {stats.map((s) => {
        const color = getTypeColor(s.type);
        const pct = Math.round((s[metric] / max) * 100);
        const active = selectedType === s.type;
        const dim = selectedType && !active;
        return (
          <button
            key={s.type}
            onClick={() => onSelectType && onSelectType(active ? null : s.type)}
            disabled={!onSelectType}
            data-testid={`type-dist-${s.type}`}
            className={cn(
              "text-left transition-opacity duration-200",
              onSelectType && "cursor-pointer",
              dim && "opacity-40"
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-sans font-bold" style={{ color }}>
                {getTypeLabel(s.type)}
              </span>
              <span className="text-xs text-sub font-sans">
                {metric === "volume"
                  ? `${(s.volume || 0).toLocaleString("es-ES")} kg`
                  : metric === "minutes"
                  ? `${s.minutes} min · ${s.count}`
                  : `${s.count} entrenos`}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </div>
          </button>
        );
      })}
      {onSelectType && selectedType && (
        <button
          onClick={() => onSelectType(null)}
          className="text-xs text-volt font-sans font-bold uppercase tracking-wide self-start mt-1"
          data-testid="type-dist-clear"
        >
          Quitar filtro
        </button>
      )}
    </div>
  );
}
