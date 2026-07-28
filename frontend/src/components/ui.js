import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

export function Overline({ children, className }) {
  return (
    <span className={cn("text-[11px] font-sans font-extrabold uppercase tracking-[0.2em] text-muted", className)}>
      {children}
    </span>
  );
}

export function Card({ children, className, ...rest }) {
  return (
    <div
      className={cn("bg-surface border border-border rounded-xl overflow-hidden", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Spinner({ className }) {
  return <Loader2 className={cn("w-6 h-6 animate-spin text-volt", className)} />;
}

export function Loading() {
  return (
    <div className="flex items-center justify-center py-24">
      <Spinner className="w-8 h-8" />
    </div>
  );
}

export function Chip({ active, color, onClick, children, testid }) {
  return (
    <button
      onClick={onClick}
      data-testid={testid}
      className={cn(
        "px-4 py-1.5 rounded-full border text-sm font-sans font-bold whitespace-nowrap transition-all duration-200 active:scale-95 flex items-center gap-2",
        active ? "text-bg border-transparent" : "text-sub border-border hover:border-borderStrong bg-surface"
      )}
      style={active && color ? { backgroundColor: color } : undefined}
    >
      {!active && color && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
      {children}
    </button>
  );
}

export function StatCard({ value, label, accent, testid }) {
  return (
    <Card className="p-4 flex flex-col gap-1">
      <span className="font-heading text-3xl sm:text-4xl leading-none" style={{ color: accent || "#D4FF00" }} data-testid={testid}>
        {value}
      </span>
      <Overline>{label}</Overline>
    </Card>
  );
}

export function PrimaryButton({ children, className, ...rest }) {
  return (
    <button
      className={cn(
        "bg-volt text-bg font-heading font-bold uppercase tracking-wider px-6 py-3 rounded-lg hover:bg-voltDim active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
