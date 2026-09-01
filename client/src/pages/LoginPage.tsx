/* LEWS Authentication: Sign In & Demo Access Portal */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Activity, ArrowLeft, ArrowRight, CheckCircle2, Lock, Shield, User, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("field-observer");

  const googleSignInMutation = trpc.auth.googleSignIn.useMutation({
    onSuccess: () => {
      setLocation("/dashboard");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Establish session
    localStorage.setItem("lews_user", JSON.stringify({ email: email || "observer@lews.org", role }));
    setLocation("/dashboard");
  };

  const handleGoogleLogin = async () => {
    try {
      await googleSignInMutation.mutateAsync({
        email: email && email.includes("@") ? email : "assfsaravanan@gmail.com",
        name: "Saravanan (Disaster Specialist)",
      });
    } catch {
      startLogin();
    }
  };

  const handleGuestDemo = () => {
    localStorage.setItem("lews_user", JSON.stringify({ email: "field-observer-demo@lews.org", role: "field-observer" }));
    setLocation("/dashboard");
  };

  return (
    <div className="auth-page-shell">
      <div className="auth-card-container">
        {/* Back Link */}
        <Link href="/" className="auth-back-link">
          <ArrowLeft size={14} />
          <span>BACK TO OVERVIEW</span>
        </Link>

        <div className="auth-card panel">
          <div className="auth-card-header">
            <div className="auth-brand-logo">
              <img src="/assets/lews-logo.png" alt="Landsora logo" />
            </div>
            <h2>Sign in to Landsora</h2>
            <p>Access the Surveyor's Field Console & Gemini AI Decision Intelligence</p>
          </div>

          {/* Google Sign In Callout */}
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="font-semibold flex items-center gap-1.5 text-amber-300">
                <Sparkles size={13} /> GOOGLE ACCOUNT AI ACCESS
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                GEMINI 3.5 FLASH
              </span>
            </div>
            <p className="text-[11px] text-stone-300 mb-2.5 leading-relaxed">
              Google Account authentication is required to activate multi-turn Gemini chatbot, Google Search grounding, and Maps terrain intelligence.
            </p>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleSignInMutation.isPending}
              className="w-full py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
            >
              {googleSignInMutation.isPending ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" />
              ) : (
                <>
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="w-3.5 h-3.5"
                  />
                  <span>SIGN IN WITH GOOGLE ACCOUNT</span>
                </>
              )}
            </button>
          </div>

          <div className="auth-divider">
            <span>OR STANDARD CONSOLE ACCESS</span>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-field">
              <label htmlFor="role-select">OPERATING ROLE</label>
              <select
                id="role-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="auth-input"
              >
                <option value="field-observer">Field Observer / Surveyor</option>
                <option value="emergency-planner">District Emergency Planner</option>
                <option value="first-responder">First Responder / Patrol</option>
                <option value="geotechnical-analyst">Geotechnical Researcher</option>
              </select>
            </div>

            <div className="auth-field">
              <label htmlFor="email-input">WORK EMAIL</label>
              <input
                id="email-input"
                type="email"
                placeholder="name@disaster-dept.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="password-input">ACCESS CODE / PASSWORD</label>
              <input
                id="password-input"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
              />
            </div>

            <button type="submit" className="button primary auth-submit-btn">
              <span>SIGN IN TO CONSOLE</span>
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="auth-divider">
            <span>OR INSTANT TABLETOP EVALUATION</span>
          </div>

          <button onClick={handleGuestDemo} className="button secondary auth-guest-btn">
            <Shield size={14} className="text-amber-400" />
            <span>ENTER AS GUEST FIELD OBSERVER (DEMO)</span>
          </button>

          <div className="auth-footer-links">
            <span>Need an organizational account? <Link href="/signup">Sign up here</Link></span>
          </div>
        </div>

        <div className="auth-trust-note">
          <CheckCircle2 size={13} className="text-emerald-400" />
          <span>Local offline caching enabled · NASA EONET v3 telemetry stream</span>
        </div>
      </div>
    </div>
  );
}

