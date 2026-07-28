import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon, LogOut, Shield, Award, TrendingUp } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Card, Overline, PrimaryButton } from "../components/ui";
import { apiError } from "../lib/api";

const inputCls =
  "w-full bg-bg border border-border rounded-lg pl-11 pr-4 py-3 text-txt placeholder-muted focus:outline-none focus:border-volt focus:ring-1 focus:ring-volt transition-colors font-sans";

export default function Account() {
  const { user, isAuthenticated, login, register, logout } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleGoogle = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Completa todos los campos");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") await login(email.trim(), password);
      else await register(email.trim(), password, name.trim());
      toast.success(mode === "signin" ? "Sesión iniciada" : "Cuenta creada");
      navigate("/");
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="animate-fade-up max-w-2xl">
        <Overline>Cuenta</Overline>
        <h1 className="font-heading font-bold uppercase text-4xl sm:text-5xl tracking-tight leading-none mt-2 mb-8">
          Tu perfil
        </h1>
        <Card className="p-6 flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-volt/15 border border-volt/40 flex items-center justify-center overflow-hidden">
            {user.picture ? (
              <img src={user.picture} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-8 h-8 text-volt" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-heading font-semibold uppercase text-xl text-txt truncate" data-testid="profile-name">
              {user.name || "Atleta"}
            </p>
            <p className="text-sub font-sans text-sm truncate" data-testid="profile-email">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] font-sans font-bold uppercase tracking-widest text-muted">
              {user.authProvider === "google" ? "Google" : "Email"}
            </span>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 flex items-center gap-3">
            <Award className="w-6 h-6 text-volt" />
            <div>
              <Overline>Récords</Overline>
              <p className="font-heading text-lg">Registrados</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-volt" />
            <div>
              <Overline>Progreso</Overline>
              <p className="font-heading text-lg">Activo</p>
            </div>
          </Card>
        </div>

        <button
          onClick={() => { logout(); toast.success("Sesión cerrada"); }}
          data-testid="logout-btn"
          className="w-full flex items-center justify-center gap-2 border border-danger text-danger font-heading font-medium uppercase tracking-wide px-6 py-3 rounded-lg hover:bg-danger/10 active:scale-95 transition-all"
        >
          <LogOut className="w-5 h-5" /> Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-up max-w-md mx-auto md:mx-0">
      <Overline>Cuenta</Overline>
      <h1 className="font-heading font-bold uppercase text-4xl sm:text-5xl tracking-tight leading-none mt-2 mb-2">
        {mode === "signin" ? "Iniciar sesión" : "Crear cuenta"}
      </h1>
      <p className="text-sub font-sans mb-8">
        Guarda tus entrenamientos y sigue tu progreso.
      </p>

      <button
        onClick={handleGoogle}
        data-testid="google-login-btn"
        className="w-full flex items-center justify-center gap-3 bg-surface border border-border rounded-lg px-6 py-3 font-sans font-bold text-txt hover:bg-surfaceHover hover:border-borderStrong active:scale-95 transition-all mb-4"
      >
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />
        Continuar con Google
      </button>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted font-sans uppercase tracking-widest">o con email</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        {mode === "signup" && (
          <div className="relative">
            <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input className={inputCls} placeholder="Nombre (opcional)" value={name} onChange={(e) => setName(e.target.value)} data-testid="auth-name-input" />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input className={inputCls} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="auth-email-input" />
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input className={inputCls} type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="auth-password-input" />
        </div>
        {error && <p className="text-danger text-sm font-sans" data-testid="auth-error">{error}</p>}
        <PrimaryButton type="submit" disabled={busy} className="w-full" data-testid="auth-submit-btn">
          <Shield className="w-4 h-4" />
          {busy ? "Un momento..." : mode === "signin" ? "Entrar" : "Crear cuenta"}
        </PrimaryButton>
      </form>

      <button
        onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
        data-testid="auth-toggle-btn"
        className="w-full text-center text-sub hover:text-txt font-sans text-sm mt-5 transition-colors"
      >
        {mode === "signin" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </button>
    </div>
  );
}
