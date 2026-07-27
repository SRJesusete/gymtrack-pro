export interface WorkoutType {
  id: string;
  label: string;
  color: string;
}

export const WORKOUT_TYPES: WorkoutType[] = [
  { id: 'fuerza', label: 'Fuerza', color: '#D4FF00' },
  { id: 'hipertrofia', label: 'Hipertrofia', color: '#22D3EE' },
  { id: 'cardio', label: 'Cardio', color: '#FB7185' },
  { id: 'movilidad', label: 'Movilidad', color: '#A78BFA' },
  { id: 'otro', label: 'Otro', color: '#F59E0B' },
];

export const DEFAULT_TYPE_COLOR = '#A1A1AA';

export function getTypeColor(id?: string | null): string {
  const t = WORKOUT_TYPES.find((w) => w.id === id);
  return t ? t.color : DEFAULT_TYPE_COLOR;
}

export function getTypeLabel(id?: string | null): string {
  const t = WORKOUT_TYPES.find((w) => w.id === id);
  return t ? t.label : 'General';
}

// Type is persisted encoded in the session `notes` column (the sessions table
// schema is fixed and has no dedicated column). Marker is stripped for display.
const TYPE_RE = /\s*::tipo=([a-z]+)\s*$/;

export function packNotes(notes: string, typeId: string): string {
  const clean = stripTypeMarker(notes);
  return `${clean}::tipo=${typeId || 'otro'}`;
}

export function unpackType(notes?: string | null): string {
  const m = TYPE_RE.exec(notes || '');
  return m ? m[1] : 'otro';
}

export function stripTypeMarker(notes?: string | null): string {
  return (notes || '').replace(TYPE_RE, '').trim();
}
