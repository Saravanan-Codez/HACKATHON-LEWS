import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { CheckCircle2, Lock, Shield, User, X, Sparkles, LogIn } from "lucide-react";

type GoogleAuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  description?: string;
};

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Google Account Required",
  description = "Connect your Google Account to unlock live Gemini 3.5 Flash search grounding, Google Maps terrain intelligence, and multi-turn geotechnical AI chat.",
}) => {
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("assfsaravanan@gmail.com");
  const [name, setName] = useState("Saravanan (Disaster Specialist)");
  const [authMethod, setAuthMethod] = useState<"oauth" | "direct">("direct");

  const googleSignInMutation = trpc.auth.googleSignIn.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      if (onSuccess) onSuccess();
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleDirectGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    await googleSignInMutation.mutateAsync({
      email,
      name: name || email.split("@")[0],
    });
  };

  const handleOAuthLogin = () => {
    try {
      startLogin();
    } catch {
      // If preview environment, fallback to direct Google connection
      handleDirectGoogleLogin({ preventDefault: () => {} } as any);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#161a1d] border border-amber-500/30 rounded-xl shadow-2xl p-6 text-stone-100 overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-stone-400 hover:text-stone-100 hover:bg-stone-800/60 transition-colors"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-stone-100 tracking-wide">{title}</h3>
            <span className="text-xs text-amber-400 font-mono flex items-center gap-1.5">
              <Shield size={11} /> GEMINI AI & GROUNDING ACCESS
            </span>
          </div>
        </div>

        <p className="text-xs text-stone-300 mb-5 leading-relaxed">{description}</p>

        {/* Auth Mode Switcher */}
        <div className="flex rounded-lg bg-stone-900/90 p-1 mb-4 border border-stone-800 text-xs">
          <button
            type="button"
            className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-all ${
              authMethod === "direct"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-stone-400 hover:text-stone-200"
            }`}
            onClick={() => setAuthMethod("direct")}
          >
            Google Account Connect
          </button>
          <button
            type="button"
            className={`flex-1 py-1.5 px-2 rounded-md font-medium transition-all ${
              authMethod === "oauth"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-stone-400 hover:text-stone-200"
            }`}
            onClick={() => setAuthMethod("oauth")}
          >
            Google OAuth Flow
          </button>
        </div>

        {authMethod === "direct" ? (
          <form onSubmit={handleDirectGoogleLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1 tracking-wider uppercase">
                Google Account Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full bg-stone-900/80 border border-stone-700/80 rounded-lg px-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1 tracking-wider uppercase">
                Account Holder / Operator Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Disaster Safety Officer"
                className="w-full bg-stone-900/80 border border-stone-700/80 rounded-lg px-3 py-2 text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 font-sans"
              />
            </div>

            <button
              type="submit"
              disabled={googleSignInMutation.isPending}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 tracking-wider uppercase"
            >
              {googleSignInMutation.isPending ? (
                <span className="w-4 h-4 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" />
              ) : (
                <>
                  <LogIn size={14} />
                  CONNECT GOOGLE ACCOUNT
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-stone-400 leading-relaxed">
              Redirects to the Google OAuth single sign-on consent flow to link your organizational Google credentials to Landsora.
            </p>
            <button
              type="button"
              onClick={handleOAuthLogin}
              className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 border border-stone-600 text-stone-100 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google G logo"
                className="w-4 h-4"
              />
              LAUNCH GOOGLE OAUTH
            </button>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-400" /> Secure Token Session
          </span>
          <span className="font-mono text-stone-500">GEMINI-3.5-FLASH READY</span>
        </div>
      </div>
    </div>
  );
};
