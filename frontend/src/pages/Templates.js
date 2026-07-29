import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Trash2, ClipboardList, Check, Play } from "lucide-react";
import { api, apiError } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { groupColor, MUSCLE_GROUPS } from "../constants/muscleGroups";
import { Card, Overline, Loading, PrimaryButton } from "../components/ui";
import { GuestBanner } from "../components/GuestBanner";
import { Modal } from "../components/Modal";
import { cn } from "../lib/utils";

export default function Templates() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [picked, setPicked] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([
      isAuthenticated ? api.get("/templates").then((r) => r.data).catch(() => []) : Promise.resolve([]),
      api.get("/exercises").then((r) => r.data),
    ]).then(([t, e]) => { setTemplates(t); setExercises(e); }).finally(() => setLoading(false));
  };
  useEffect(load, [isAuthenticated]);

  const toggle = (ex) => {
    setPicked((prev) =>
      prev.find((p) => p.exerciseId === ex.id)
        ? prev.filter((p) => p.exerciseId !== ex.id)
        : [...prev, { exerciseId: ex.id, exerciseName: ex.name, muscleGroup: ex.muscleGroup, defaultSets: 3, defaultReps: 10 }]
    );
  };

  const save = async () => {
    if (!name.trim()) { toast.error("Ponle un nombre a la plantilla"); return; }
    if (picked.length === 0) { toast.error("Añade al menos un ejercicio"); return; }
    setSaving(true);
    try {
      await api.post("/templates", { name: name.trim(), description: desc.trim(), exercises: picked });
      toast.success("Plantilla creada");
      setOpen(false); setName(""); setDesc(""); setPicked([]);
      load();
    } catch (e) { toast.error(apiError(e)); } finally { setSaving(false); }
  };

  const del = async (id, e) => {
    e.stopPropagation();
    await api.delete(`/templates/${id}`);
    toast.success("Plantilla eliminada");
    setTemplates((t) => t.filter((x) => x.id !== id));
  };

  const byGroup = useMemo(() => {
    const map = {};
    for (const ex of exercises) (map[ex.muscleGroup || "Otros"] = map[ex.muscleGroup || "Otros"] || []).push(ex);
    return map;
  }, [exercises]);

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-up">
      <div className="flex items-end justify-between mb-8">
        <div>
          <Overline>Rutinas</Overline>
          <h1 className="font-heading font-bold uppercase text-4xl sm:text-5xl tracking-tight leading-none mt-2">Plantillas</h1>
        </div>
        <PrimaryButton onClick={() => (isAuthenticated ? setOpen(true) : navigate("/cuenta"))} data-testid="new-template-btn" className="!px-4 !py-2.5 text-sm">
          <Plus className="w-4 h-4" /> Nueva
        </PrimaryButton>
      </div>

      {!isAuthenticated && <GuestBanner text="Inicia sesión para crear tus propias plantillas de entreno." />}

      {templates.length === 0 ? (
        <div className="py-16 flex flex-col items-center gap-3">
          <ClipboardList className="w-12 h-12 text-border" />
          <p className="text-muted font-sans">No tienes plantillas todavía.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {templates.map((t) => (
            <Card key={t.id} className="p-5" data-testid={`template-${t.id}`}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="font-heading font-semibold uppercase text-xl truncate">{t.name}</p>
                  {t.description && <p className="text-sub text-sm font-sans mt-0.5">{t.description}</p>}
                </div>
                <button onClick={(e) => del(t.id, e)} data-testid={`template-delete-${t.id}`} className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {(t.exercises || []).map((e, i) => (
                  <span key={i} className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full border" style={{ color: groupColor(e.muscleGroup), borderColor: groupColor(e.muscleGroup) + "55" }}>
                    {e.exerciseName}
                  </span>
                ))}
              </div>
              <button
                onClick={() => navigate(`/sesion/nueva?template=${t.id}`)}
                data-testid={`template-start-${t.id}`}
                className="w-full flex items-center justify-center gap-2 border border-border rounded-lg py-2.5 font-heading font-medium uppercase tracking-wide text-sm hover:bg-surfaceHover hover:border-borderStrong active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 text-volt" /> Empezar
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nueva plantilla" testid="template-modal">
        <div className="flex flex-col gap-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre" data-testid="template-name-input"
            className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-txt placeholder-muted focus:outline-none focus:border-volt font-sans" />
          <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descripción (opcional)" data-testid="template-desc-input"
            className="w-full bg-bg border border-border rounded-lg px-4 py-3 text-txt placeholder-muted focus:outline-none focus:border-volt font-sans" />
          <div>
            <Overline>Ejercicios · {picked.length} seleccionados</Overline>
            <div className="mt-3 flex flex-col gap-4 max-h-72 overflow-y-auto pr-1">
              {MUSCLE_GROUPS.filter((g) => byGroup[g.key]).map((g) => (
                <div key={g.key}>
                  <p className="text-xs font-sans font-bold uppercase tracking-wide mb-2" style={{ color: g.color }}>{g.label}</p>
                  <div className="flex flex-col gap-1.5">
                    {byGroup[g.key].map((ex) => {
                      const on = picked.find((p) => p.exerciseId === ex.id);
                      return (
                        <button key={ex.id} onClick={() => toggle(ex)} data-testid={`template-ex-${ex.id}`}
                          className={cn("flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-colors", on ? "border-volt bg-volt/10" : "border-border hover:border-borderStrong")}>
                          <span className="text-sm font-sans">{ex.name}</span>
                          {on && <Check className="w-4 h-4 text-volt" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <PrimaryButton onClick={save} disabled={saving} className="w-full" data-testid="template-save-btn">
            {saving ? "Guardando..." : "Crear plantilla"}
          </PrimaryButton>
        </div>
      </Modal>
    </div>
  );
}
