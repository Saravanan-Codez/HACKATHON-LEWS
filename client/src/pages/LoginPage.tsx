/* LEWS Authentication: Sign In & Demo Access Portal */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Activity, ArrowLeft, ArrowRight, CheckCircle2, Lock, Shield, User } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("field-observer");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // For this prototype, establish demo session and route directly to the operational dashboard
    localStorage.setItem("lews_user", JSON.stringify({ email: email || "observer@lews.org", role }));
    setLocation("/dashboard");
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
              <img src="/assets/lews-logo.png" alt="LEWS logo" />
            </div>
            <h2>Sign in to LEWS</h2>
            <p>Access the Surveyor's Field Console & Decision Intelligence</p>
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
