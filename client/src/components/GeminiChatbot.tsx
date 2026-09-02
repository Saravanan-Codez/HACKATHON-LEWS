/* Landsora AI Companion Component: Database-free, user-owned Gemini usage & browser session */
import React, { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Trash2,
  Copy,
  Check,
  Search,
  MapPin,
  ExternalLink,
  Shield,
  Layers,
  Zap,
  Brain,
  Key,
  KeyRound,
  X,
  Lock,
} from "lucide-react";
import { GoogleAuthModal } from "./GoogleAuthModal";

export type ChatRole = "GEOTECHNICAL_SPECIALIST" | "DISASTER_COORDINATOR" | "FIELD_SURVEYOR";
export type ChatModel = "gemini-3.5-flash" | "gemini-3.1-flash-lite" | "gemini-3.1-pro-preview";

type ChatMessage = {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: string;
  groundingSources?: { title?: string; url?: string }[];
  mapSources?: { placeId?: string; title?: string; address?: string }[];
};

type GeminiChatbotProps = {
  location?: string;
  rainfall?: number;
  soil?: number;
  tilt?: number;
  riskScore?: number;
  riskLevel?: string;
  language?: string;
  onOpenGoogleAuth?: () => void;
};

const ROLE_INFO: Record<ChatRole, { label: string; icon: string; description: string }> = {
  GEOTECHNICAL_SPECIALIST: {
    label: "Geotechnical Engineer",
    icon: "🔬",
    description: "Slope stability, pore pressure, inclinometer drift & shear strength analysis.",
  },
  DISASTER_COORDINATOR: {
    label: "Disaster Coordinator",
    icon: "🚨",
    description: "NDMA/SDMA protocols, road pass access, evacuation corridors & relief shelters.",
  },
  FIELD_SURVEYOR: {
    label: "IoT Sensor Specialist",
    icon: "📡",
    description: "ESP32 hardware, capacitive soil moisture probe calibration & tilt telemetry.",
  },
};

const MODEL_INFO: Record<ChatModel, { name: string; tag: string; badge: string; icon: any }> = {
  "gemini-3.5-flash": {
    name: "Gemini 3.5 Flash",
    tag: "FAST & GROUNDED",
    badge: "Recommended",
    icon: Zap,
  },
  "gemini-3.1-flash-lite": {
    name: "Gemini 3.1 Flash Lite",
    tag: "HIGH SPEED",
    badge: "Lowest Latency",
    icon: Zap,
  },
  "gemini-3.1-pro-preview": {
    name: "Gemini 3.1 Pro Preview",
    tag: "COMPLEX REASONING",
    badge: "Deep Analysis",
    icon: Brain,
  },
};

const PROMPT_SUGGESTIONS = [
  "What is the current slope failure risk for this station?",
  "Explain what the soil moisture saturation and tilt mean.",
  "Which road routes or mountain passes are at risk?",
  "Draft an emergency evacuation bulletin for local residents.",
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  location = "Kodagu Escarpment",
  rainfall = 24.5,
  soil = 72.0,
  tilt = 0.082,
  riskScore = 72,
  riskLevel = "CRITICAL",
  language = "EN",
}) => {
  const meQuery = trpc.auth.me.useQuery();
  const isAuthenticated = Boolean(meQuery.data?.user);
  const user = meQuery.data?.user;

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [customApiKey, setCustomApiKey] = useState<string>(() => {
    try {
      return localStorage.getItem("landsora_gemini_api_key") || "";
    } catch {
      return "";
    }
  });
  const [tempApiKey, setTempApiKey] = useState("");

  const [role, setRole] = useState<ChatRole>("GEOTECHNICAL_SPECIALIST");
  const [model, setModel] = useState<ChatModel>("gemini-3.5-flash");
  const [grounding, setGrounding] = useState<"none" | "search" | "maps">("none");
  const [inputQuery, setInputQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Initialize messages from browser localStorage (ephemeral, zero database)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("landsora_ai_chat_history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: "initial-welcome",
        role: "model",
        text: `Hello! I am your **AI Companion**, assisting with Landsora slope stability and disaster decision support. Currently monitoring **${location}** (Rainfall: ${rainfall} mm/hr, Soil Moisture: ${soil}%, Risk Level: ${riskLevel}). How can I assist you with slope stability diagnostics, IMD alert verification, or emergency road clearance today?`,
        timestamp: new Date().toISOString(),
      },
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save to browser localStorage on change (zero database)
  useEffect(() => {
    try {
      localStorage.setItem("landsora_ai_chat_history", JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      if (data.responseMessage) {
        const resp = data.responseMessage as any;
        const text = resp.parts ? resp.parts.map((p: any) => p.text).join("\n") : "";
        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          role: "model",
          text,
          timestamp: resp.timestamp || new Date().toISOString(),
          groundingSources: resp.groundingSources,
          mapSources: resp.mapSources,
        };
        setMessages((prev) => [...prev, newMsg]);
      }
    },
    onError: (err) => {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "model",
        text: `Error connecting to AI Companion: ${err.message}. If using your personal Gemini API key, please verify it in Key Settings.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    },
  });

  const handleSaveApiKey = () => {
    const trimmed = tempApiKey.trim();
    setCustomApiKey(trimmed);
    try {
      if (trimmed) {
        localStorage.setItem("landsora_gemini_api_key", trimmed);
      } else {
        localStorage.removeItem("landsora_gemini_api_key");
      }
    } catch {}
    setApiKeyModalOpen(false);
  };

  const handleClearApiKey = () => {
    setCustomApiKey("");
    setTempApiKey("");
    try {
      localStorage.removeItem("landsora_gemini_api_key");
    } catch {}
    setApiKeyModalOpen(false);
  };

  const handleSendMessage = async (customText?: string) => {
    const queryToSend = customText || inputQuery;
    if (!queryToSend.trim() || chatMutation.isPending) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      text: queryToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputQuery("");

    // Send multi-turn chat to server proxy with optional personal API key
    chatMutation.mutate({
      apiKey: customApiKey ? customApiKey.trim() : undefined,
      messages: newMessages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
        timestamp: m.timestamp,
      })),
      role,
      model,
      grounding,
      context: {
        location,
        rainfall,
        soil,
        tilt,
        riskScore,
        riskLevel,
        language,
      },
    });
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    const fresh: ChatMessage[] = [
      {
        id: "cleared-welcome",
        role: "model",
        text: `AI Companion conversation history cleared. Ready for new geotechnical inquiries regarding ${location} slope telemetry.`,
        timestamp: new Date().toISOString(),
      },
    ];
    setMessages(fresh);
    try {
      localStorage.setItem("landsora_ai_chat_history", JSON.stringify(fresh));
    } catch {}
  };

  return (
    <div className="gemini-chatbot-container panel flex flex-col h-full min-h-[500px] sm:min-h-[580px] max-h-[82vh] bg-[#121619] border border-stone-800/90 rounded-xl overflow-hidden shadow-2xl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 bg-stone-900/95 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/25 to-amber-600/10 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-sm">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-stone-100 tracking-wide font-mono">
                AI COMPANION
              </h3>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30">
                MULTI-TURN
              </span>
            </div>
            <p className="text-[10.5px] text-stone-400 hidden xs:block">
              Geotechnical & Disaster Safety Intelligence
            </p>
          </div>
        </div>

        {/* Right side controls: Personal Key, Google status, Clear history */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Custom Gemini API Key Pill */}
          <button
            type="button"
            onClick={() => {
              setTempApiKey(customApiKey);
              setApiKeyModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono transition-colors border ${
              customApiKey
                ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50"
                : "bg-stone-800/80 text-stone-300 border-stone-700 hover:bg-stone-700/80"
            }`}
            title="Set or manage your own Google Gemini API key"
          >
            <KeyRound size={12} className={customApiKey ? "text-emerald-400" : "text-amber-400"} />
            <span>{customApiKey ? "CUSTOM KEY ACTIVE" : "USE OWN GEMINI KEY"}</span>
          </button>

          {/* Account status */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-stone-800/80 border border-stone-700 text-[10px] text-stone-300">
              <Shield size={11} className="text-amber-400 flex-none" />
              <span className="font-mono truncate max-w-[100px]">
                {user?.email ? user.email.split("@")[0] : "Google"}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/15 border border-amber-500/30 text-[10px] text-amber-300 hover:bg-amber-500/25 transition-colors font-mono"
            >
              <Lock size={11} /> 1-Click Sign In
            </button>
          )}

          <button
            type="button"
            onClick={handleClearHistory}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Control Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-stone-900/60 border-b border-stone-800/70 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Role selector */}
          <div className="flex items-center gap-1 bg-stone-950/80 p-1 rounded-lg border border-stone-800">
            {(["GEOTECHNICAL_SPECIALIST", "DISASTER_COORDINATOR", "FIELD_SURVEYOR"] as ChatRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`px-2 py-0.5 rounded text-[10.5px] font-mono transition-all flex items-center gap-1 ${
                  role === r
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold"
                    : "text-stone-400 hover:text-stone-200"
                }`}
                title={ROLE_INFO[r].description}
              >
                <span>{ROLE_INFO[r].icon}</span>
                <span className="hidden sm:inline">{ROLE_INFO[r].label.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          {/* Model selector */}
          <div className="flex items-center gap-1 bg-stone-950/80 p-1 rounded-lg border border-stone-800">
            {(["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemini-3.1-pro-preview"] as ChatModel[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModel(m)}
                className={`px-2 py-0.5 rounded text-[10.5px] font-mono transition-all ${
                  model === m
                    ? "bg-stone-800 text-stone-100 font-semibold border border-stone-600"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {m.replace("gemini-", "").replace("-preview", "")}
              </button>
            ))}
          </div>
        </div>

        {/* Grounding tools */}
        <div className="flex items-center gap-1 bg-stone-950/80 p-1 rounded-lg border border-stone-800">
          <button
            type="button"
            onClick={() => setGrounding("none")}
            className={`px-2 py-0.5 rounded text-[10.5px] font-mono ${
              grounding === "none" ? "bg-stone-800 text-stone-200" : "text-stone-400 hover:text-stone-200"
            }`}
          >
            Direct
          </button>
          <button
            type="button"
            onClick={() => setGrounding("search")}
            className={`px-2 py-0.5 rounded text-[10.5px] font-mono flex items-center gap-1 ${
              grounding === "search" ? "bg-blue-600/30 text-blue-300 border border-blue-500/40" : "text-stone-400 hover:text-stone-200"
            }`}
            title="Google Search Grounding (Live IMD bulletins)"
          >
            <Search size={11} /> Search
          </button>
          <button
            type="button"
            onClick={() => setGrounding("maps")}
            className={`px-2 py-0.5 rounded text-[10.5px] font-mono flex items-center gap-1 ${
              grounding === "maps" ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40" : "text-stone-400 hover:text-stone-200"
            }`}
            title="Google Maps Terrain Grounding"
          >
            <MapPin size={11} /> Maps
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            <div
              className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-lg ${
                msg.role === "user"
                  ? "bg-amber-500 text-stone-950 font-medium rounded-tr-none"
                  : "bg-stone-900/90 text-stone-200 border border-stone-800 rounded-tl-none font-sans"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Grounding Sources */}
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-stone-800 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-mono text-stone-400 block w-full">
                    Grounding Sources:
                  </span>
                  {msg.groundingSources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-mono bg-stone-950/80 hover:bg-stone-800 text-blue-300 px-2 py-0.5 rounded border border-stone-700 transition-colors"
                    >
                      <ExternalLink size={10} />
                      <span className="truncate max-w-[180px]">{src.title || src.url}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Message Meta & Copy Button */}
            <div className="flex items-center gap-2 mt-1 px-1 text-[10px] font-mono text-stone-500">
              <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              <button
                type="button"
                onClick={() => handleCopy(msg.text, msg.id)}
                className="hover:text-stone-300 transition-colors"
                title="Copy message"
              >
                {copiedId === msg.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              </button>
            </div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-stone-900/80 border border-stone-800 text-stone-400 text-xs w-fit">
            <Sparkles size={14} className="text-amber-400 animate-spin" />
            <span className="font-mono">AI Companion is thinking…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      <div className="px-3 py-1.5 bg-stone-900/40 border-t border-stone-800/60 overflow-x-auto flex items-center gap-1.5 scrollbar-none whitespace-nowrap">
        {PROMPT_SUGGESTIONS.map((suggestion, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(suggestion)}
            className="px-2.5 py-1 rounded-full bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-stone-100 text-[10.5px] font-mono border border-stone-800 transition-all shrink-0"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-2.5 sm:p-3 bg-stone-900/90 border-t border-stone-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask AI Companion about slope stability, pore saturation, or evacuation…"
          className="flex-1 bg-stone-950/90 border border-stone-700/80 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || chatMutation.isPending}
          className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold disabled:opacity-40 transition-all shrink-0 shadow-md shadow-amber-500/20"
        >
          <Send size={15} />
        </button>
      </form>

      {/* Custom Gemini API Key Modal */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-[#151C1F] border border-stone-700 rounded-2xl p-6 text-stone-100 shadow-2xl">
            <button
              onClick={() => setApiKeyModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-100 p-1 rounded"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <KeyRound size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-100 font-mono">Personal Gemini API Key</h3>
                <p className="text-[11px] text-stone-400">Your key stays strictly inside your browser (zero database persistence)</p>
              </div>
            </div>

            <p className="text-xs text-stone-300 mb-4 leading-relaxed">
              Use your personal Google Gemini API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Google AI Studio</a>. You will draw directly against your personal Gemini quota without limits.
            </p>

            <div className="mb-4">
              <label className="block text-[10.5px] font-mono text-stone-400 uppercase mb-1">
                Gemini API Key
              </label>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs font-mono text-stone-100 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              {customApiKey && (
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 text-xs font-mono transition-colors"
                >
                  Clear Key
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setApiKeyModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs font-mono transition-colors shadow-md shadow-amber-500/20"
                >
                  Save to Browser
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
      />
    </div>
  );
};
