import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { api, apiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { WORKOUT_TYPES, getTypeColor, getTypeLabel } from "../constants/workoutTypes";
import { Card, Overline, Loading, Chip, PrimaryButton, StatCard } from "../components/ui";
import { GuestBanner } from "../components/GuestBanner";
import { Modal } from "../components/Modal";
import { TypeDistribution } from "../components/TypeDistribution";
import { cn, ymd, fmtNum } from "../lib/utils";

const DOW = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const inputCls = "w-full bg-bg border border-border rounded-lg px-4 py-3 text-txt placeholder-muted focus:outline-none focus:border-volt font-sans";

export default function Calendar() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("month");
  const [cursor, setCursor] = useState(new Date());
  const [filterType, setFilterType] = useState(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", durationMinutes: "", notes: "", date: ymd(new Date()), workoutType: "fuerza", totalVolume: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!isAuthenticated) { setSessions([]); setLoading(false); return; }
    api.get("/sessions").then(({ data }) => setSessions(data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [isAuthenticated]);

  const filtered = useMemo(
    () => (filterType ? sessions.filter((s) => (s.workoutType || "otro") === filterType) : sessions),
    [sessions, filterType]
  );

  const byDay = useMemo(() => {
    const map = {};
    for (const s of filtered) (map[ymd(s.startedAt)] = map[ymd(s.startedAt)] || []).push(s);
    return map;
  }, [filtered]);

  // Month grid
  const monthGrid = useMemo(() => {
    const y = cursor.getFullYear(), m = cursor.getMonth();
    const first = new Date(y, m, 1);
    const startDow = (first.getDay() + 6) % 7; // Monday=0
    const days = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(y, m, d));
    return cells;
  }, [cursor]);

  const weekDays = useMemo(() => {
    const d = new Date(cursor);
    const dow = (d.getDay() + 6) % 7;
    const monday = new Date(d); monday.setDate(d.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => { const x = new Date(monday); x.setDate(monday.getDate() + i); return x; });
  }, [cursor]);

  const periodSessions = useMemo(() => {
    if (view === "month") {
      return filtered.filter((s) => { const d = new Date(s.startedAt); return d.getFullYear() === cursor.getFullYear() && d.getMonth() === cursor.getMonth(); });
    }
    const keys = new Set(weekDays.map(ymd));
    return filtered.filter((s) => keys.has(ymd(s.startedAt)));
  }, [filtered, view, cursor, weekDays]);

  const summary = useMemo(() => ({
    count: periodSessions.length,
    volume: periodSessions.reduce((a, s) => a + (s.totalVolume || 0), 0),
    minutes: periodSessions.reduce((a, s) => a + (s.durationMinutes || 0), 0),
  }), [periodSessions]);

  const openAdd = (date) => {
    if (!isAuthenticated) { navigate("/cuenta"); return; }
    setEditing(null);
    setForm({ name: "", durationMinutes: "", notes: "", date: ymd(date || new Date()), workoutType: "fuerza", totalVolume: "" });
    setOpen(true);
  };
  const openEdit = (s) => {
    setEditing(s);
    setForm({ name: s.name, durationMinutes: String(s.durationMinutes || ""), notes: s.notes || "", date: ymd(s.startedAt), workoutType: s.workoutType || "otro", totalVolume: String(s.totalVolume || "") });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast.error("Ponle un nombre al entreno"); return; }
    setSaving(true);
    const startedAt = new Date(`${form.date}T10:00:00`).toISOString();
    const payload = {
      name: form.name.trim(),
      startedAt,
      durationMinutes: parseInt(form.durationMinutes) || 0,
      notes: form.notes.trim(),
      workoutType: form.workoutType,
      totalVolume: parseFloat(form.totalVolume) || 0,
    };
    try {
      if (editing) await api.put(`/sessions/${editing.id}`, payload);
      else await api.post("/sessions/quick", payload);
      toast.success(editing ? "Entreno actualizado" : "Entreno guardado");
      setOpen(false);
      load();
    } catch (e) { toast.error(apiError(e)); } finally { setSaving(false); }
  };

  const del = async () => {
    if (!editing) return;
    await api.delete(`/sessions/${editing.id}`);
    toast.success("Entreno eliminado");
    setOpen(false);
    load();
  };

  const move = (dir) => {
    const d = new Date(cursor);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * 7);
    setCursor(d);
  };

  if (loading) return <Loading />;
  const todayKey = ymd(new Date());

  return (
    <div className="animate-fade-up">
      <div className="flex items-end justify-between mb-6">
        <div>
          <Overline>Planificación</Overline>
          <h1 className="font-heading font-bold uppercase text-4xl sm:text-5xl tracking-tight leading-none mt-2">Calendario</h1>
        </div>
        <PrimaryButton onClick={() => openAdd(new Date())} data-testid="calendar-add-btn" className="!px-4 !py-2.5 text-sm">
          <Plus className="w-4 h-4" /> Añadir
        </PrimaryButton>
      </div>

      {!isAuthenticated && <GuestBanner text="Estás viendo el calendario como invitado. Inicia sesión para guardar tus entrenos." />}

      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          <button onClick={() => setView("month")} data-testid="calendar-view-month-btn"
            className={cn("px-4 py-2 rounded-full text-sm font-heading uppercase tracking-wide transition-all", view === "month" ? "bg-volt text-bg" : "bg-surface border border-border text-sub")}>Mes</button>
          <button onClick={() => setView("week")} data-testid="calendar-view-week-btn"
            className={cn("px-4 py-2 rounded-full text-sm font-heading uppercase tracking-wide transition-all", view === "week" ? "bg-volt text-bg" : "bg-surface border border-border text-sub")}>Semana</button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => move(-1)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface border border-border hover:border-borderStrong" data-testid="calendar-prev-btn"><ChevronLeft className="w-5 h-5" /></button>
          <span className="font-heading uppercase text-sm min-w-[130px] text-center">
            {view === "month" ? `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}` : `Sem. ${ymd(weekDays[0]).slice(5)}`}
          </span>
          <button onClick={() => move(1)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface border border-border hover:border-borderStrong" data-testid="calendar-next-btn"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
        <Chip active={!filterType} color="#D4FF00" onClick={() => setFilterType(null)} testid="calendar-filter-all">Todos</Chip>
        {WORKOUT_TYPES.map((t) => (
          <Chip key={t.id} active={filterType === t.id} color={t.color} onClick={() => setFilterType(filterType === t.id ? null : t.id)} testid={`calendar-filter-${t.id}`}>{t.label}</Chip>
        ))}
      </div>

      {view === "month" ? (
        <Card className="p-3 sm:p-4 mb-6">
          <div className="grid grid-cols-7 mb-2">
            {DOW.map((d) => <div key={d} className="text-center text-xs font-heading text-muted uppercase">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {monthGrid.map((date, i) => {
              if (!date) return <div key={i} />;
              const key = ymd(date);
              const list = byDay[key] || [];
              const isToday = key === todayKey;
              return (
                <button key={i} onClick={() => (list.length ? openEdit(list[0]) : openAdd(date))} data-testid={`calendar-day-${key}`}
                  className={cn("aspect-square rounded-lg border p-1 flex flex-col items-center justify-start gap-1 transition-colors hover:border-borderStrong",
                    isToday ? "border-volt/60 bg-volt/5" : "border-border bg-bg")}>
                  <span className={cn("text-xs font-sans", isToday ? "text-volt font-bold" : "text-sub")}>{date.getDate()}</span>
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {list.slice(0, 3).map((s, j) => <span key={j} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: getTypeColor(s.workoutType) }} />)}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-2 mb-6">
          {weekDays.map((date) => {
            const key = ymd(date);
            const list = byDay[key] || [];
            return (
              <Card key={key} className="p-3" data-testid={`calendar-week-${key}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn("font-heading uppercase text-sm", key === todayKey ? "text-volt" : "text-sub")}>
                    {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][(date.getDay() + 6) % 7]} {date.getDate()}
                  </span>
                  <button onClick={() => openAdd(date)} className="text-muted hover:text-volt" data-testid={`calendar-week-add-${key}`}><Plus className="w-4 h-4" /></button>
                </div>
                {list.length === 0 ? <p className="text-muted text-xs font-sans">Descanso</p> : (
                  <div className="flex flex-col gap-1.5">
                    {list.map((s) => (
                      <button key={s.id} onClick={() => openEdit(s)} className="flex items-center gap-2 text-left" data-testid={`calendar-session-${s.id}`}>
                        <span className="w-1.5 h-6 rounded-full" style={{ backgroundColor: getTypeColor(s.workoutType) }} />
                        <div><p className="font-sans font-bold text-sm">{s.name}</p><p className="text-muted text-xs">{getTypeLabel(s.workoutType)} · {s.durationMinutes} min</p></div>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard value={fmtNum(summary.count)} label="Entrenos" testid="calendar-sum-count" />
        <StatCard value={fmtNum(summary.volume)} label="Kg" testid="calendar-sum-volume" />
        <StatCard value={fmtNum(summary.minutes)} label="Min" testid="calendar-sum-minutes" />
      </div>

      <Card className="p-5">
        <Overline>Distribución por tipo</Overline>
        <div className="mt-4">
          <TypeDistribution sessions={periodSessions} metric="minutes" selectedType={filterType} onSelectType={setFilterType} />
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? "Editar entreno" : "Nuevo entreno"} testid="calendar-modal">
        <div className="flex flex-col gap-4">
          <input className={inputCls} placeholder="Nombre del entreno" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="calendar-form-name-input" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Overline>Fecha</Overline>
              <input type="date" className={cn(inputCls, "mt-1.5")} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} data-testid="calendar-form-date-input" />
            </div>
            <div>
              <Overline>Duración (min)</Overline>
              <input type="number" className={cn(inputCls, "mt-1.5")} placeholder="45" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} data-testid="calendar-form-duration-input" />
            </div>
          </div>
          <div>
            <Overline>Tipo</Overline>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {WORKOUT_TYPES.map((t) => (
                <Chip key={t.id} active={form.workoutType === t.id} color={t.color} onClick={() => setForm({ ...form, workoutType: t.id })} testid={`calendar-form-type-${t.id}`}>{t.label}</Chip>
              ))}
            </div>
          </div>
          <div>
            <Overline>Volumen total (kg, opcional)</Overline>
            <input type="number" className={cn(inputCls, "mt-1.5")} placeholder="0" value={form.totalVolume} onChange={(e) => setForm({ ...form, totalVolume: e.target.value })} data-testid="calendar-form-volume-input" />
          </div>
          <div>
            <Overline>Notas</Overline>
            <textarea className={cn(inputCls, "mt-1.5 min-h-[80px]")} placeholder="¿Cómo fue el entreno?" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} data-testid="calendar-form-notes-input" />
          </div>
          <div className="flex gap-3">
            {editing && (
              <button onClick={del} data-testid="calendar-form-delete-btn" className="flex items-center justify-center gap-2 border border-danger text-danger font-heading uppercase tracking-wide px-4 py-3 rounded-lg hover:bg-danger/10 active:scale-95 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <PrimaryButton onClick={save} disabled={saving} className="flex-1" data-testid="calendar-form-save-btn">
              {saving ? "Guardando..." : editing ? "Guardar cambios" : "Guardar entreno"}
            </PrimaryButton>
          </div>
        </div>
      </Modal>
    </div>
  );
}
