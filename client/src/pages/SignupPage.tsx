/* LEWS Registration: Sign Up Portal */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, ArrowRight, CheckCircle2, Shield } from "lucide-react";

export default function SignupPage() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState("field-observer");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("lews_user", JSON.stringify({ name, email, organization, role }));
    setLocation("/dashboard");
  };

  return (
    <div className="auth-page-shell">
      <div className="auth-card-container">
        <Link href="/" className="auth-back-link">
          <ArrowLeft size={14} />
          <span>BACK TO OVERVIEW</span>
        </Link>

        <div className="auth-card panel">
          <div className="auth-card-header">
            <div className="auth-brand-logo">
              <img src="/assets/lews-logo.png" alt="Landsora logo" />
            </div>
            <h2>Register Observer Account</h2>
            <p>Deploy hyperlocal telemetry and emergency decision support</p>
          </div>

          <form onSubmit={handleSignup} className="auth-form">
            <div className="auth-field">
              <label htmlFor="name-input">FULL NAME</label>
              <input
                id="name-input"
                type="text"
                placeholder="Dr. S. Ramesh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="email-input">WORK EMAIL</label>
              <input
                id="email-input"
                type="email"
                placeholder="ramesh@sdma.karnataka.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="org-input">ORGANIZATION / DISTRICT PANCHAYAT</label>
              <input
                id="org-input"
                type="text"
                placeholder="District Disaster Management Authority"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label htmlFor="role-select">DEPLOYMENT ROLE</label>
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

            <button type="submit" className="button primary auth-submit-btn">
              <span>CREATE ACCOUNT & LAUNCH CONSOLE</span>
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="auth-footer-links">
            <span>Already have an account? <Link href="/login">Sign in here</Link></span>
          </div>
        </div>

        <div className="auth-trust-note">
          <CheckCircle2 size={13} className="text-emerald-400" />
          <span>Compliant with open disaster intelligence standards · MIT License</span>
        </div>
      </div>
    </div>
  );
}
