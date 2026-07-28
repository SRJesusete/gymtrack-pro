export const WORKOUT_TYPES = [
  { id: "fuerza", label: "Fuerza", color: "#D4FF00" },
  { id: "hipertrofia", label: "Hipertrofia", color: "#22D3EE" },
  { id: "cardio", label: "Cardio", color: "#FB7185" },
  { id: "movilidad", label: "Movilidad", color: "#A78BFA" },
  { id: "otro", label: "Otro", color: "#F59E0B" },
];

export const DEFAULT_TYPE_COLOR = "#A1A1AA";

export function getTypeColor(id) {
  const t = WORKOUT_TYPES.find((w) => w.id === id);
  return t ? t.color : DEFAULT_TYPE_COLOR;
}

export function getTypeLabel(id) {
  const t = WORKOUT_TYPES.find((w) => w.id === id);
  return t ? t.label : "General";
}
