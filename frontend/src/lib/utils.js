import { clsx } from "clsx";

export function cn(...args) {
  return clsx(args);
}

export function formatDate(iso, opts) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-ES", opts || { day: "numeric", month: "short", year: "numeric" });
}

export function ymd(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fmtNum(n) {
  return (n || 0).toLocaleString("es-ES");
}
