import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TopNav, BottomNav } from "./components/Nav";
import { Loading, Spinner } from "./components/ui";

import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import History from "./pages/History";
import Templates from "./pages/Templates";
import Progress from "./pages/Progress";
import Help from "./pages/Help";
import Account from "./pages/Account";
import SessionNew from "./pages/SessionNew";
import SessionDetail from "./pages/SessionDetail";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-bg text-txt">
      <TopNav />
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 md:pb-16">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/cuenta" replace />;
  return children;
}

function AuthCallback() {
  const { loginWithSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const processed = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;
    const hash = location.hash || window.location.hash;
    const match = hash.match(/session_id=([^&]+)/);
    const sessionId = match ? decodeURIComponent(match[1]) : null;
    (async () => {
      if (!sessionId) {
        navigate("/cuenta", { replace: true });
        return;
      }
      try {
        await loginWithSession(sessionId);
        window.history.replaceState(null, "", "/");
        navigate("/", { replace: true });
      } catch {
        setError("No se pudo iniciar sesión con Google.");
        setTimeout(() => navigate("/cuenta", { replace: true }), 1500);
      }
    })();
  }, [location.hash, loginWithSession, navigate]);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
      <Spinner className="w-8 h-8" />
      <p className="text-sub font-sans">{error || "Iniciando sesión..."}</p>
    </div>
  );
}

function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ayuda" element={<Help />} />
        <Route path="/cuenta" element={<Account />} />
        <Route path="/calendario" element={<Calendar />} />
        <Route path="/plantillas" element={<Templates />} />
        <Route path="/historial" element={<History />} />
        <Route path="/progreso" element={<Progress />} />
        <Route path="/sesion/nueva" element={<SessionNew />} />
        <Route path="/sesion/:id" element={<SessionDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster theme="dark" position="top-center" richColors />
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}
