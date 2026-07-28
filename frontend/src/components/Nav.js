import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Dumbbell, CalendarDays, Clock, ClipboardList, TrendingUp, BookOpen, User } from "lucide-react";
import { cn } from "../lib/utils";

const ITEMS = [
  { to: "/", label: "Entreno", icon: Dumbbell, testid: "nav-home" },
  { to: "/calendario", label: "Calendario", icon: CalendarDays, testid: "nav-calendar" },
  { to: "/historial", label: "Historial", icon: Clock, testid: "nav-history" },
  { to: "/plantillas", label: "Plantillas", icon: ClipboardList, testid: "nav-templates" },
  { to: "/progreso", label: "Progreso", icon: TrendingUp, testid: "nav-progress" },
  { to: "/ayuda", label: "Ayuda", icon: BookOpen, testid: "nav-help" },
  { to: "/cuenta", label: "Cuenta", icon: User, testid: "nav-account" },
];

export function TopNav() {
  return (
    <header className="hidden md:flex sticky top-0 z-40 w-full bg-bg/85 backdrop-blur-xl border-b border-border">
      <div className="w-full max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <NavLink to="/" className="flex items-center gap-2" data-testid="brand-logo">
          <div className="w-2.5 h-2.5 rounded-sm bg-volt" />
          <span className="font-heading font-bold uppercase tracking-wide text-lg text-txt">
            GymTrack<span className="text-volt"> Pro</span>
          </span>
        </NavLink>
        <nav className="flex items-center gap-1">
          {ITEMS.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.to === "/"}
              data-testid={`${it.testid}-desktop`}
              className={({ isActive }) =>
                cn(
                  "px-3 py-2 rounded-lg text-sm font-heading font-medium uppercase tracking-wide transition-colors duration-200 flex items-center gap-2",
                  isActive ? "text-volt bg-surface" : "text-sub hover:text-txt hover:bg-surface"
                )
              }
            >
              <it.icon className="w-4 h-4" strokeWidth={2.4} />
              {it.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function BottomNav() {
  const { pathname } = useLocation();
  const mobileItems = ITEMS.filter((i) => ["/", "/calendario", "/progreso", "/ayuda", "/cuenta"].includes(i.to));
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 bg-bg/90 backdrop-blur-xl border-t border-border flex justify-around items-stretch pb-safe pt-2">
      {mobileItems.map((it) => {
        const active = it.to === "/" ? pathname === "/" : pathname.startsWith(it.to);
        return (
          <NavLink
            key={it.to}
            to={it.to}
            data-testid={`${it.testid}-mobile`}
            className="flex flex-col items-center gap-1 px-2 py-1 flex-1"
          >
            <it.icon className={cn("w-6 h-6 transition-colors", active ? "text-volt" : "text-muted")} strokeWidth={active ? 2.6 : 2.2} />
            <span className={cn("text-[10px] font-heading uppercase tracking-wide", active ? "text-volt" : "text-muted")}>
              {it.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
