import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Play, Pause, X, Timer as TimerIcon, RotateCcw } from "lucide-react";

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const play = (freq, start, dur) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };
    play(880, 0, 0.18);
    play(880, 0.22, 0.18);
    play(1174, 0.44, 0.3);
    setTimeout(() => ctx.close(), 1200);
  } catch (_) {}
}

export const RestTimer = forwardRef(function RestTimer(_, ref) {
  const [total, setTotal] = useState(90);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);
  const endAtRef = useRef(0);
  const tickRef = useRef(null);

  const stop = useCallback(() => {
    clearInterval(tickRef.current);
    tickRef.current = null;
    setRunning(false);
    setPaused(false);
    setDone(false);
    setRemaining(0);
  }, []);

  const start = useCallback((seconds = 90) => {
    clearInterval(tickRef.current);
    setTotal(seconds);
    setRemaining(seconds);
    setRunning(true);
    setPaused(false);
    setDone(false);
    endAtRef.current = Date.now() + seconds * 1000;
    tickRef.current = setInterval(() => {
      const left = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(tickRef.current);
        tickRef.current = null;
        setRunning(false);
        setDone(true);
        beep();
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
      }
    }, 250);
  }, []);

  useImperativeHandle(ref, () => ({ start }), [start]);

  useEffect(() => () => clearInterval(tickRef.current), []);

  const togglePause = () => {
    if (paused) {
      endAtRef.current = Date.now() + remaining * 1000;
      tickRef.current = setInterval(() => {
        const left = Math.max(0, Math.round((endAtRef.current - Date.now()) / 1000));
        setRemaining(left);
        if (left <= 0) {
          clearInterval(tickRef.current);
          tickRef.current = null;
          setRunning(false);
          setDone(true);
          beep();
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
      }, 250);
      setPaused(false);
    } else {
      clearInterval(tickRef.current);
      tickRef.current = null;
      setPaused(true);
    }
  };

  const addTime = (delta) => {
    const next = Math.max(0, remaining + delta);
    setRemaining(next);
    setTotal((t) => Math.max(t, next));
    if (!paused) endAtRef.current = Date.now() + next * 1000;
  };

  if (!running && !done) return null;

  const pct = total > 0 ? (remaining / total) * 100 : 0;

  return (
    <div
      data-testid="rest-timer-bar"
      className="fixed left-1/2 -translate-x-1/2 bottom-28 md:bottom-24 z-40 w-[92%] max-w-md animate-fade-up"
    >
      <div
        className="relative overflow-hidden rounded-2xl border bg-surface shadow-2xl"
        style={{ borderColor: done ? "#D4FF00" : "#262626" }}
      >
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-300 ease-linear"
          style={{ width: `${pct}%`, backgroundColor: done ? "#D4FF00" : "rgba(212,255,0,0.12)" }}
        />
        <div className="relative flex items-center gap-3 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <TimerIcon className="w-5 h-5 shrink-0" style={{ color: done ? "#09090B" : "#D4FF00" }} />
            <div className="min-w-0">
              <p
                className="font-heading font-bold uppercase text-[10px] tracking-widest leading-none"
                style={{ color: done ? "#09090B" : "#A1A1AA" }}
              >
                {done ? "¡Descanso terminado!" : "Descanso"}
              </p>
              <p
                data-testid="rest-timer-display"
                className="font-heading font-bold tabular-nums leading-none text-2xl"
                style={{ color: done ? "#09090B" : "#FAFAFA" }}
              >
                {done ? "¡A darle!" : fmt(remaining)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            {done ? (
              <>
                <button
                  onClick={() => start(total)}
                  data-testid="rest-timer-repeat"
                  className="flex items-center gap-1 rounded-full bg-obsidian text-volt px-3 py-2 font-sans font-bold text-xs active:scale-95 transition-transform"
                >
                  <RotateCcw className="w-4 h-4" /> Otra vez
                </button>
                <button
                  onClick={stop}
                  data-testid="rest-timer-close"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-obsidian text-white active:scale-95 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => addTime(-15)}
                  data-testid="rest-timer-minus"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-bg border border-border text-sub hover:text-txt active:scale-95 transition-transform font-sans text-xs font-bold"
                >
                  -15
                </button>
                <button
                  onClick={() => addTime(15)}
                  data-testid="rest-timer-plus"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-bg border border-border text-sub hover:text-txt active:scale-95 transition-transform font-sans text-xs font-bold"
                >
                  +15
                </button>
                <button
                  onClick={togglePause}
                  data-testid="rest-timer-pause"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-volt text-obsidian active:scale-95 transition-transform"
                >
                  {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                </button>
                <button
                  onClick={stop}
                  data-testid="rest-timer-skip"
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-bg border border-border text-sub hover:text-danger active:scale-95 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
