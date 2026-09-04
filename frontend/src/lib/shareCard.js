import { getTypeLabel } from "../constants/workoutTypes";

const W = 1080;
const H = 1350;
const VOLT = "#D4FF00";
const BG = "#09090B";
const SURFACE = "#161616";
const TXT = "#F4F4F5";
const SUB = "#A1A1AA";
const MUTED = "#71717A";

const h = (size, weight = 700) => `${weight} ${size}px Oswald, sans-serif`;
const s = (size, weight = 500) => `${weight} ${size}px Manrope, sans-serif`;

function roundRect(ctx, x, y, w, hh, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + hh, r);
  ctx.arcTo(x + w, y + hh, x, y + hh, r);
  ctx.arcTo(x, y + hh, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function buildShareCard(session) {
  try {
    await Promise.all([
      document.fonts.load("700 80px Oswald"),
      document.fonts.load("700 32px Manrope"),
      document.fonts.load("500 30px Manrope"),
    ]);
  } catch (_) {}

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = VOLT;
  ctx.fillRect(0, 0, W, 12);

  const M = 72;
  let y = 110;

  // Brand
  ctx.fillStyle = VOLT;
  ctx.beginPath();
  ctx.arc(M + 10, y - 10, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = h(40);
  ctx.fillStyle = TXT;
  ctx.fillText("GYMTRACK", M + 36, y);
  const bw = ctx.measureText("GYMTRACK").width;
  ctx.fillStyle = VOLT;
  ctx.fillText(" PRO", M + 36 + bw, y);

  // Type badge + date
  y += 90;
  const typeLabel = (getTypeLabel(session.workoutType) || "Entreno").toUpperCase();
  ctx.font = s(26, 800);
  const tlw = ctx.measureText(typeLabel).width;
  ctx.fillStyle = "rgba(212,255,0,0.14)";
  roundRect(ctx, M, y - 34, tlw + 44, 50, 25);
  ctx.fill();
  ctx.fillStyle = VOLT;
  ctx.fillText(typeLabel, M + 22, y);
  ctx.fillStyle = SUB;
  ctx.font = s(28);
  const dateStr = new Date(session.startedAt).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  ctx.fillText(dateStr, M + tlw + 68, y);

  // Workout name
  y += 100;
  ctx.fillStyle = TXT;
  let nameSize = 88;
  ctx.font = h(nameSize);
  let name = (session.name || "Entreno").toUpperCase();
  while (ctx.measureText(name).width > W - M * 2 && nameSize > 44) {
    nameSize -= 4;
    ctx.font = h(nameSize);
  }
  ctx.fillText(name, M, y);

  // Stats row
  y += 70;
  const stats = [
    { v: Math.round(session.totalVolume || 0).toLocaleString("es-ES"), l: "KG TOTALES" },
    { v: String(session.durationMinutes || 0), l: "MINUTOS" },
    { v: String((session.exercises || []).length), l: "EJERCICIOS" },
  ];
  const cw = (W - M * 2 - 40) / 3;
  stats.forEach((st, i) => {
    const x = M + i * (cw + 20);
    ctx.fillStyle = SURFACE;
    roundRect(ctx, x, y, cw, 170, 20);
    ctx.fill();
    ctx.fillStyle = VOLT;
    ctx.font = h(64);
    ctx.fillText(st.v, x + 28, y + 92);
    ctx.fillStyle = MUTED;
    ctx.font = s(22, 800);
    ctx.fillText(st.l, x + 28, y + 138);
  });
  y += 170 + 70;

  // PRs
  const prs = [];
  for (const e of session.exercises || []) {
    for (const st of e.sets || []) {
      if (st.isPr) prs.push({ name: e.exerciseName, weight: st.weight, reps: st.reps });
    }
  }
  if (prs.length > 0) {
    ctx.fillStyle = VOLT;
    ctx.font = s(24, 800);
    ctx.fillText("NUEVOS RÉCORDS", M, y);
    y += 24;
    for (const pr of prs.slice(0, 3)) {
      ctx.fillStyle = "rgba(212,255,0,0.10)";
      roundRect(ctx, M, y, W - M * 2, 84, 18);
      ctx.fill();
      ctx.strokeStyle = "rgba(212,255,0,0.45)";
      ctx.lineWidth = 2;
      roundRect(ctx, M, y, W - M * 2, 84, 18);
      ctx.stroke();
      ctx.fillStyle = VOLT;
      ctx.font = h(34, 600);
      ctx.fillText("★", M + 28, y + 55);
      ctx.fillStyle = TXT;
      let prName = pr.name.toUpperCase();
      if (prName.length > 28) prName = prName.slice(0, 27) + "…";
      ctx.fillText(prName, M + 80, y + 55);
      ctx.fillStyle = VOLT;
      ctx.font = h(36);
      const val = `${pr.weight} KG × ${pr.reps}`;
      ctx.fillText(val, W - M - 28 - ctx.measureText(val).width, y + 56);
      y += 100;
    }
    y += 30;
  }

  // Exercises list
  const exercises = (session.exercises || []).slice(0, prs.length > 0 ? 5 : 7);
  if (exercises.length > 0) {
    ctx.fillStyle = MUTED;
    ctx.font = s(24, 800);
    ctx.fillText("ENTRENO", M, y);
    y += 22;
    for (const e of exercises) {
      const best = (e.sets || []).reduce((b, st) => ((st.weight || 0) * 1 > (b?.weight || 0) * 1 ? st : b), null);
      ctx.fillStyle = SURFACE;
      roundRect(ctx, M, y, W - M * 2, 74, 16);
      ctx.fill();
      ctx.fillStyle = TXT;
      ctx.font = h(30, 600);
      let en = e.exerciseName.toUpperCase();
      if (en.length > 30) en = en.slice(0, 29) + "…";
      ctx.fillText(en, M + 28, y + 48);
      ctx.fillStyle = SUB;
      ctx.font = s(26, 700);
      const n = (e.sets || []).length;
      const seriesTxt = `${n} ${n === 1 ? "serie" : "series"}`;
      const info = best ? `${seriesTxt} · mejor ${best.weight} kg × ${best.reps}` : seriesTxt;
      ctx.fillText(info, W - M - 28 - ctx.measureText(info).width, y + 47);
      y += 88;
    }
    const remaining = (session.exercises || []).length - exercises.length;
    if (remaining > 0) {
      ctx.fillStyle = MUTED;
      ctx.font = s(26, 700);
      ctx.fillText(`+${remaining} ejercicios más`, M, y + 30);
    }
  }

  // Footer
  ctx.fillStyle = MUTED;
  ctx.font = s(24, 700);
  const foot = "Registrado con GymTrack Pro";
  ctx.fillText(foot, M, H - 60);
  ctx.fillStyle = VOLT;
  ctx.fillRect(W - M - 120, H - 78, 120, 6);

  return canvas;
}

export async function buildStreakCard(streak) {
  try {
    await Promise.all([
      document.fonts.load("700 80px Oswald"),
      document.fonts.load("700 32px Manrope"),
      document.fonts.load("500 30px Manrope"),
    ]);
  } catch (_) {}

  const count = streak.count || 0;
  const thisWeek = !!streak.thisWeek;
  const last8 = streak.last8 || [];
  const totalWorkouts = streak.totalWorkouts || 0;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = VOLT;
  ctx.fillRect(0, 0, W, 12);

  const M = 72;
  let y = 110;

  // Brand
  ctx.textAlign = "left";
  ctx.fillStyle = VOLT;
  ctx.beginPath();
  ctx.arc(M + 10, y - 10, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = h(40);
  ctx.fillStyle = TXT;
  ctx.fillText("GYMTRACK", M + 36, y);
  const bw = ctx.measureText("GYMTRACK").width;
  ctx.fillStyle = VOLT;
  ctx.fillText(" PRO", M + 36 + bw, y);

  // Label
  y += 110;
  ctx.textAlign = "center";
  ctx.fillStyle = VOLT;
  ctx.font = s(30, 800);
  ctx.fillText("RACHA SEMANAL", W / 2, y);

  // Flame + big number
  y += 250;
  ctx.fillStyle = VOLT;
  ctx.font = h(300);
  ctx.fillText(String(count), W / 2, y);

  // Sub label
  y += 90;
  ctx.fillStyle = TXT;
  ctx.font = h(70);
  const unit = count === 1 ? "SEMANA SEGUIDA" : "SEMANAS SEGUIDAS";
  ctx.fillText(unit, W / 2, y);

  // Motivational line
  y += 70;
  ctx.fillStyle = SUB;
  ctx.font = s(32, 600);
  let motive;
  if (count === 0) motive = "Empieza tu racha esta semana";
  else if (thisWeek) motive = "Esta semana ya has entrenado. ¡Sigue así!";
  else motive = "Entrena esta semana para mantenerla";
  ctx.fillText(motive, W / 2, y);

  // 8-week bars
  y += 130;
  const barW = 44;
  const gap = 28;
  const totalW = last8.length * barW + (last8.length - 1) * gap;
  let bx = (W - totalW) / 2;
  const baseY = y + 130;
  last8.forEach((on, i) => {
    const bh = on ? 130 : 46;
    ctx.fillStyle = on ? VOLT : "#3F3F46";
    if (i === last8.length - 1 && !on) ctx.globalAlpha = 0.5;
    roundRect(ctx, bx, baseY - bh, barW, bh, 12);
    ctx.fill();
    ctx.globalAlpha = 1;
    bx += barW + gap;
  });
  y = baseY + 60;
  ctx.fillStyle = MUTED;
  ctx.font = s(24, 700);
  ctx.fillText("ÚLTIMAS 8 SEMANAS", W / 2, y);

  // Total workouts stat
  y += 120;
  const cardW = 480;
  const cardX = (W - cardW) / 2;
  ctx.fillStyle = SURFACE;
  roundRect(ctx, cardX, y, cardW, 150, 20);
  ctx.fill();
  ctx.fillStyle = VOLT;
  ctx.font = h(72);
  ctx.fillText(totalWorkouts.toLocaleString("es-ES"), W / 2, y + 90);
  ctx.fillStyle = MUTED;
  ctx.font = s(24, 800);
  ctx.fillText("ENTRENOS TOTALES", W / 2, y + 128);

  // Footer
  ctx.textAlign = "left";
  ctx.fillStyle = MUTED;
  ctx.font = s(24, 700);
  ctx.fillText("Registrado con GymTrack Pro", M, H - 60);
  ctx.fillStyle = VOLT;
  ctx.fillRect(W - M - 120, H - 78, 120, 6);

  return canvas;
}

export function canvasToBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}
