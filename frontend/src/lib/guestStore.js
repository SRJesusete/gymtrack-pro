// Local guest workout store (no account). Data lives in the browser.
const KEY = "gymtrack_guest_sessions";
const PR_KEY = "gymtrack_guest_prs";

function read(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}
function write(key, v) {
  localStorage.setItem(key, JSON.stringify(v));
}
function uid(prefix) {
  return prefix + Math.random().toString(36).slice(2, 14);
}
function nowIso() {
  return new Date().toISOString();
}

export const guest = {
  hasData() {
    return read(KEY).length > 0;
  },
  listSessions() {
    return read(KEY).sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
  },
  getSession(id) {
    return read(KEY).find((s) => s.id === id) || null;
  },
  createFull(payload) {
    const sid = uid("ges_");
    const started = payload.startedAt || nowIso();
    let totalVolume = 0;
    const prs = read(PR_KEY);
    const newPrs = [];
    const exDocs = (payload.exercises || []).map((ex, i) => {
      const weights = ex.sets.map((s) => s.weight || 0);
      const maxW = weights.length ? Math.max(...weights) : 0;
      const prevBest = prs
        .filter((p) => p.exerciseId === ex.exerciseId)
        .reduce((m, p) => Math.max(m, p.prValue), 0);
      const isPrExercise = maxW > prevBest && maxW > 0;
      let marked = false;
      if (isPrExercise) {
        prs.push({
          id: uid("gpr_"),
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          prType: "weight",
          prValue: maxW,
          sessionId: sid,
          achievedAt: started,
        });
        newPrs.push(ex.exerciseName);
      }
      const sets = ex.sets.map((s, j) => {
        let isPr = false;
        if (isPrExercise && !marked && (s.weight || 0) === maxW) {
          isPr = true;
          marked = true;
        }
        totalVolume += (s.weight || 0) * (s.reps || 0);
        return { setNumber: j + 1, weight: s.weight || 0, reps: s.reps || 0, isPr, isWarmup: !!s.isWarmup };
      });
      return { exerciseId: ex.exerciseId, exerciseName: ex.exerciseName, muscleGroup: ex.muscleGroup, sortOrder: i, sets };
    });
    write(PR_KEY, prs);
    const doc = {
      id: sid,
      name: payload.name,
      workoutType: payload.workoutType || "otro",
      startedAt: started,
      completedAt: nowIso(),
      totalVolume,
      durationMinutes: payload.exercises?.length ? Math.max(1, payload.exercises.length * 5) : 10,
      notes: "",
      exercises: exDocs,
      guest: true,
    };
    const all = read(KEY);
    all.push(doc);
    write(KEY, all);
    return { ...doc, newPrs };
  },
  quickLog(payload) {
    const doc = {
      id: uid("ges_"),
      name: payload.name,
      workoutType: payload.workoutType || "otro",
      startedAt: payload.startedAt,
      completedAt: payload.startedAt,
      totalVolume: payload.totalVolume || 0,
      durationMinutes: payload.durationMinutes || 0,
      notes: payload.notes || "",
      exercises: [],
      guest: true,
    };
    const all = read(KEY);
    all.push(doc);
    write(KEY, all);
    return doc;
  },
  updateSession(id, payload) {
    const all = read(KEY);
    const i = all.findIndex((s) => s.id === id);
    if (i >= 0) {
      const clean = Object.fromEntries(Object.entries(payload).filter(([, v]) => v !== undefined && v !== null));
      all[i] = { ...all[i], ...clean };
      write(KEY, all);
      return all[i];
    }
    return null;
  },
  deleteSession(id) {
    write(KEY, read(KEY).filter((s) => s.id !== id));
    write(PR_KEY, read(PR_KEY).filter((p) => p.sessionId !== id));
  },
  listPRs() {
    return read(PR_KEY).sort((a, b) => new Date(b.achievedAt) - new Date(a.achievedAt));
  },
  clear() {
    localStorage.removeItem(KEY);
    localStorage.removeItem(PR_KEY);
  },
};
