import React from "react";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Card } from "./ui";

export function GuestBanner({ text }) {
  const navigate = useNavigate();
  return (
    <Card className="p-4 mb-6 flex items-center justify-between gap-3 border-volt/30 bg-volt/5" data-testid="guest-banner">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-lg bg-volt/15 flex items-center justify-center shrink-0">
          <LogIn className="w-5 h-5 text-volt" />
        </div>
        <p className="text-sm font-sans text-sub">{text}</p>
      </div>
      <button
        onClick={() => navigate("/cuenta")}
        data-testid="guest-banner-login-btn"
        className="shrink-0 bg-volt text-bg font-heading font-bold uppercase tracking-wide text-sm px-4 py-2 rounded-lg hover:bg-voltDim active:scale-95 transition-all"
      >
        Entrar
      </button>
    </Card>
  );
}
