import React, { useEffect, useMemo, useState } from "react";
import { Search, Dumbbell, ChevronDown, PlayCircle, ExternalLink } from "lucide-react";
import { MUSCLE_GROUPS, groupColor, getVideoInfo, getVideoId, searchYouTube, YT_RED } from "../constants/muscleGroups";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { Card, Overline, Chip, Loading, StatCard } from "../components/ui";
import { Modal } from "../components/Modal";
import { cn } from "../lib/utils";

export default function Help() {
  const { isAuthenticated } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [videoEx, setVideoEx] = useState(null);

  const openVideo = (ex) => setVideoEx(ex);

  useEffect(() => {
    Promise.all([
      api.get("/exercises").then((r) => r.data).catch(() => []),
      isAuthenticated ? api.get("/user-exercises").then((r) => r.data).catch(() => []) : Promise.resolve([]),
    ])
      .then(([pub, usr]) => setExercises([...pub, ...usr]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const grouped = useMemo(() => {
    const q = query.toLowerCase();
    const filtered = exercises.filter((ex) => {
      const mq = !q || ex.name.toLowerCase().includes(q) || (ex.muscleGroup || "").toLowerCase().includes(q);
      const mg = filter === "all" || (ex.muscleGroup || "Otros") === filter;
      return mq && mg;
    });
    const map = {};
    for (const ex of filtered) {
      const g = ex.muscleGroup || "Otros";
      (map[g] = map[g] || []).push(ex);
    }
    const sorted = {};
    for (const mg of MUSCLE_GROUPS) if (map[mg.key]) sorted[mg.key] = map[mg.key];
    for (const [k, v] of Object.entries(map)) if (!sorted[k]) sorted[k] = v;
    return sorted;
  }, [exercises, query, filter]);

  if (loading) return <Loading />;

  return (
    <div className="animate-fade-up">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2 h-2 rounded-full bg-volt" />
        <Overline className="text-volt">Guía técnica</Overline>
      </div>
      <h1 className="font-heading font-bold uppercase text-4xl sm:text-5xl tracking-tight leading-none mb-2">
        Ejercicios
      </h1>
      <p className="text-sub font-sans mb-6">Domina la técnica con consejos y vídeos para cada movimiento.</p>

      <div className="relative mb-4 max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar ejercicio o grupo..."
          data-testid="help-search-input"
          className="w-full bg-surface border border-border rounded-full pl-11 pr-4 py-3 text-txt placeholder-muted focus:outline-none focus:border-volt transition-colors font-sans"
        />
      </div>

      <div className="grid grid-cols-2 sm:max-w-xs gap-4 mb-5">
        <StatCard value={exercises.length} label="Ejercicios" testid="help-stat-exercises" />
        <StatCard value={MUSCLE_GROUPS.length} label="Grupos" testid="help-stat-groups" />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-6">
        <Chip active={filter === "all"} color="#D4FF00" onClick={() => setFilter("all")} testid="help-filter-all">Todos</Chip>
        {MUSCLE_GROUPS.map((g) => (
          <Chip key={g.key} active={filter === g.key} color={g.color} onClick={() => setFilter(g.key)} testid={`help-filter-${g.key}`}>
            {g.label}
          </Chip>
        ))}
      </div>

      {Object.entries(grouped).map(([group, exs]) => {
        const gc = groupColor(group);
        return (
          <div key={group} className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ backgroundColor: gc + "1F", borderColor: gc }}>
                <Dumbbell className="w-5 h-5" style={{ color: gc }} />
              </div>
              <div>
                <p className="font-heading font-semibold uppercase text-xl tracking-wide">{group}</p>
                <p className="text-muted text-sm font-sans">{exs.length} ejercicios</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {exs.map((ex) => {
                const info = getVideoInfo(ex.name);
                const open = expanded === ex.id;
                return (
                  <Card key={ex.id} data-testid={`help-exercise-${ex.id}`} className="flex">
                    <div className="w-1 shrink-0" style={{ backgroundColor: gc }} />
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-sans font-extrabold text-txt">{ex.name}</p>
                          {ex.description && <p className="text-sub text-sm font-sans mt-0.5">{ex.description}</p>}
                        </div>
                        <button
                          onClick={() => openVideo(ex)}
                          data-testid={`help-video-${ex.id}`}
                          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surfaceHover transition-colors"
                        >
                          <PlayCircle className="w-5 h-5" style={{ color: YT_RED }} />
                        </button>
                      </div>
                      <button
                        onClick={() => setExpanded(open ? null : ex.id)}
                        data-testid={`help-tips-toggle-${ex.id}`}
                        className="mt-2 flex items-center gap-1 text-volt text-sm font-sans font-bold"
                      >
                        {open ? "Ocultar consejos" : "Ver consejos"}
                        <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} />
                      </button>
                      {open && (
                        <div className="mt-3 flex flex-col gap-3">
                          {info.tips.length > 0 && (
                            <div>
                              <Overline className="text-volt">Técnica correcta</Overline>
                              <ul className="mt-2 flex flex-col gap-1.5">
                                {info.tips.map((t) => (
                                  <li key={t} className="flex gap-2 text-sm text-sub font-sans">
                                    <span className="w-1.5 h-1.5 rounded-full bg-volt mt-1.5 shrink-0" />{t}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {info.errors.length > 0 && (
                            <div>
                              <Overline className="text-danger">Errores comunes</Overline>
                              <ul className="mt-2 flex flex-col gap-1.5">
                                {info.errors.map((t) => (
                                  <li key={t} className="flex gap-2 text-sm text-sub font-sans">
                                    <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />{t}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <button
                            onClick={() => openVideo(ex)}
                            data-testid={`help-youtube-${ex.id}`}
                            className="w-full flex items-center justify-center gap-2 rounded-full py-2.5 font-sans font-extrabold text-white active:scale-95 transition-transform"
                            style={{ backgroundColor: YT_RED }}
                          >
                            <PlayCircle className="w-4 h-4" /> Ver vídeo
                          </button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}

      {Object.keys(grouped).length === 0 && (
        <div className="py-16 flex flex-col items-center gap-3">
          <Search className="w-12 h-12 text-border" />
          <p className="text-muted font-sans">{query ? `Sin resultados para "${query}"` : "No hay ejercicios en este grupo"}</p>
        </div>
      )}

      <Modal open={!!videoEx} onClose={() => setVideoEx(null)} title={videoEx?.name || "Vídeo"} testid="help-video-modal">
        {videoEx && (() => {
          const vid = getVideoId(videoEx.name);
          const info = getVideoInfo(videoEx.name);
          return (
            <div className="flex flex-col gap-4">
              {vid ? (
                <button
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${vid}`, "_blank")}
                  data-testid="help-video-play"
                  className="group relative w-full rounded-xl overflow-hidden bg-black block"
                  style={{ aspectRatio: "16/9" }}
                >
                  <img
                    src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`}
                    alt={videoEx.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: YT_RED }}>
                      <PlayCircle className="w-9 h-9 text-white" />
                    </span>
                  </span>
                  <span className="absolute bottom-2 right-2 text-[10px] font-sans font-bold text-white/90 bg-black/60 px-2 py-0.5 rounded">YouTube</span>
                </button>
              ) : (
                <div className="rounded-xl border border-border bg-bg p-6 flex flex-col items-center gap-3 text-center">
                  <PlayCircle className="w-10 h-10" style={{ color: YT_RED }} />
                  <p className="text-sub font-sans text-sm">Abre el mejor vídeo de técnica de <span className="text-txt font-bold">{videoEx.name}</span> en YouTube.</p>
                  <button
                    onClick={() => window.open(searchYouTube(info.search), "_blank")}
                    data-testid="help-video-modal-search"
                    className="flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-sans font-extrabold text-white active:scale-95 transition-transform"
                    style={{ backgroundColor: YT_RED }}
                  >
                    <PlayCircle className="w-4 h-4" /> Ver en YouTube
                  </button>
                </div>
              )}
              <a
                href={vid ? `https://www.youtube.com/watch?v=${vid}` : searchYouTube(info.search)}
                target="_blank"
                rel="noreferrer"
                data-testid="help-video-modal-external"
                className="flex items-center justify-center gap-1.5 text-sub hover:text-txt text-xs font-sans transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Abrir en YouTube
              </a>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
