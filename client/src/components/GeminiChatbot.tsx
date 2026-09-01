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
  Lock,
  LogIn,
  RefreshCw,
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
  language?: "EN" | "HI" | "TA" | "TE" | "KN" | "ML";
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
    tag: "GENERAL & GROUNDING",
    badge: "Fast & Grounded",
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
    badge: "Deep Geotechnical Analysis",
    icon: Brain,
  },
};

const PRESET_PROMPTS: { text: string; role: ChatRole; grounding: "none" | "search" | "maps" }[] = [
  {
    text: "Analyze current slope factor of safety given our rainfall and soil moisture readings.",
    role: "GEOTECHNICAL_SPECIALIST",
    grounding: "none",
  },
  {
    text: "Search latest IMD red alerts and monsoonal rainfall bulletins for Western Ghats.",
    role: "DISASTER_COORDINATOR",
    grounding: "search",
  },
  {
    text: "Check Google Maps terrain and road pass corridors for landslides near Kodagu.",
    role: "DISASTER_COORDINATOR",
    grounding: "maps",
  },
  {
    text: "What steps should be taken if our MPU6050 inclinometer records sudden drift?",
    role: "FIELD_SURVEYOR",
    grounding: "none",
  },
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  location = "Kodagu, Western Ghats",
  rainfall = 0,
  soil = 50,
  tilt = 0.05,
  riskScore = 30,
  riskLevel = "LOW",
  language = "EN",
  onOpenGoogleAuth,
}) => {
  const meQuery = trpc.auth.me.useQuery();
  const isAuthenticated = Boolean(meQuery.data?.user);
  const user = meQuery.data?.user;

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [role, setRole] = useState<ChatRole>("GEOTECHNICAL_SPECIALIST");
  const [model, setModel] = useState<ChatModel>("gemini-3.5-flash");
  const [grounding, setGrounding] = useState<"none" | "search" | "maps">("none");
  const [inputQuery, setInputQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-welcome",
      role: "model",
      text: `Hello! I am your Landsora AI Geotechnical & Disaster Safety Assistant powered by Gemini. Currently monitoring **${location}** (Rainfall: ${rainfall} mm/hr, Soil Moisture: ${soil}%, Risk Level: ${riskLevel}). How can I assist with slope monitoring, road status, or geotechnical diagnostics today?`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = trpc.chat.send.useMutation({
    onSuccess: (data) => {
      if ((data as any).requiresAuth) {
        setAuthModalOpen(true);
        return;
      }

      if (data.responseMessage) {
        const resp = data.responseMessage as any;
        const text = resp.parts ? resp.parts.map((p: any) => p.text).join("\n") : "";
        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
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
        text: `Error connecting to Gemini API: ${err.message}. If using Search or Maps grounding, please ensure your Google account is connected.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    },
  });

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || inputQuery).trim();
    if (!textToSend || chatMutation.isPending) return;

    if (!isAuthenticated) {
      if (onOpenGoogleAuth) {
        onOpenGoogleAuth();
      } else {
        setAuthModalOpen(true);
      }
      return;
    }

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      role: "user",
      text: textToSend,
      timestamp: new Date().toISOString(),
    };

    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setInputQuery("");

    // Prepare API format
    const apiMessages = nextHistory.map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
      timestamp: m.timestamp,
    }));

    await chatMutation.mutateAsync({
      messages: apiMessages,
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

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "cleared-welcome",
        role: "model",
        text: `Conversation history cleared. Ready for new inquiries regarding ${location} slope telemetry.`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="gemini-chatbot-container panel flex flex-col h-full min-h-[580px] max-h-[720px] bg-[#121619] border border-stone-800/90 rounded-xl overflow-hidden shadow-2xl">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-stone-900/90 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-stone-100 tracking-wide">
                GEMINI AI CHATBOT
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                MULTI-TURN
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Role-guided geotechnical and emergency decision support
            </p>
          </div>
        </div>

        {/* Right side controls: Clear history & Google status */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300">
              <Shield size={11} className="text-emerald-400" />
              <span className="font-mono">
                {user?.email ? user.email.split("@")[0] : "Google Account"}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-[11px] font-medium text-amber-300 hover:bg-amber-500/30 transition-colors"
            >
              <Lock size={11} /> Connect Google Account
            </button>
          )}

          <button
            type="button"
            onClick={handleClearHistory}
            className="p-1.5 rounded-md text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Role & Model & Tool Grounding Config Ribbon */}
      <div className="px-4 py-2.5 bg-stone-900/50 border-b border-stone-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Role Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">ROLE:</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as ChatRole)}
            className="bg-stone-800/90 border border-stone-700/80 text-stone-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-400 font-sans"
          >
            <option value="GEOTECHNICAL_SPECIALIST">🔬 Geotechnical Specialist</option>
            <option value="DISASTER_COORDINATOR">🚨 Disaster Coordinator</option>
            <option value="FIELD_SURVEYOR">📡 IoT Field Surveyor</option>
          </select>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">MODEL:</span>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as ChatModel)}
            className="bg-stone-800/90 border border-stone-700/80 text-stone-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-400 font-sans"
          >
            <option value="gemini-3.5-flash">⚡ Gemini 3.5 Flash (Default / Balanced)</option>
            <option value="gemini-3.1-flash-lite">🚀 Gemini 3.1 Flash Lite (Fast)</option>
            <option value="gemini-3.1-pro-preview">🧠 Gemini 3.1 Pro Preview (Complex)</option>
          </select>
        </div>

        {/* Grounding Tool Selector */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">GROUNDING:</span>
          <div className="inline-flex rounded-md p-0.5 bg-stone-800/80 border border-stone-700/70">
            <button
              type="button"
              onClick={() => setGrounding("none")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                grounding === "none" ? "bg-stone-700 text-stone-100 shadow-sm" : "text-stone-400 hover:text-stone-200"
              }`}
            >
              Direct
            </button>
            <button
              type="button"
              onClick={() => setGrounding("search")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                grounding === "search" ? "bg-blue-600/80 text-white shadow-sm" : "text-stone-400 hover:text-stone-200"
              }`}
              title="Google Search Grounding via gemini-3.5-flash"
            >
              <Search size={10} /> Search
            </button>
            <button
              type="button"
              onClick={() => setGrounding("maps")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all flex items-center gap-1 ${
                grounding === "maps" ? "bg-emerald-600/80 text-white shadow-sm" : "text-stone-400 hover:text-stone-200"
              }`}
              title="Google Maps Grounding via gemini-3.5-flash"
            >
              <MapPin size={10} /> Maps
            </button>
          </div>
        </div>
      </div>

      {/* Preset Prompt Pills */}
      <div className="px-4 py-2 bg-stone-900/30 border-b border-stone-800/60 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        <span className="text-[10px] font-mono text-stone-500 whitespace-nowrap">QUICK PROMPTS:</span>
        {PRESET_PROMPTS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setRole(p.role);
              setGrounding(p.grounding);
              handleSendMessage(p.text);
            }}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-stone-800/70 hover:bg-stone-700 border border-stone-700/60 text-[11px] text-stone-300 hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            {p.grounding === "search" && <Search size={10} className="text-blue-400" />}
            {p.grounding === "maps" && <MapPin size={10} className="text-emerald-400" />}
            {p.text.length > 36 ? `${p.text.slice(0, 36)}…` : p.text}
          </button>
        ))}
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-stone-200 scrollbar-thin scrollbar-thumb-stone-700">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                  isUser
                    ? "bg-amber-500 text-stone-950 font-bold"
                    : "bg-stone-800 border border-stone-700 text-amber-400"
                }`}
              >
                {isUser ? <User size={13} /> : <Bot size={13} />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative rounded-xl px-3.5 py-2.5 text-xs leading-relaxed shadow-md ${
                  isUser
                    ? "bg-amber-500/15 border border-amber-500/30 text-amber-100"
                    : "bg-stone-900/90 border border-stone-800 text-stone-200"
                }`}
              >
                {/* Header within message */}
                <div className="flex items-center justify-between gap-3 mb-1 text-[10px] text-stone-400 font-mono">
                  <span>{isUser ? "OPERATOR" : ROLE_INFO[role].label.toUpperCase()}</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>

                {/* Body text */}
                <div className="whitespace-pre-wrap font-sans text-stone-100">{msg.text}</div>

                {/* Grounding Sources (Search) */}
                {msg.groundingSources && msg.groundingSources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-stone-800/80">
                    <div className="text-[10px] font-mono text-blue-400 flex items-center gap-1 mb-1">
                      <Search size={10} /> GOOGLE SEARCH SOURCES & CITATIONS
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.groundingSources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/40 border border-blue-800/50 text-[10px] text-blue-300 hover:underline"
                        >
                          <ExternalLink size={9} />
                          {src.title || src.url || "Web Source"}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grounding Places (Maps) */}
                {msg.mapSources && msg.mapSources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-stone-800/80">
                    <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mb-1">
                      <MapPin size={10} /> GOOGLE MAPS GROUNDED LOCATIONS
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.mapSources.map((place, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/50 text-[10px] text-emerald-300"
                        >
                          <MapPin size={9} />
                          {place.title} {place.address ? `(${place.address})` : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick copy button */}
                {!isUser && (
                  <button
                    type="button"
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="absolute bottom-1.5 right-1.5 p-1 rounded bg-stone-800/80 text-stone-400 opacity-0 group-hover:opacity-100 hover:text-stone-200 transition-opacity"
                    title="Copy response"
                  >
                    {copiedId === msg.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {chatMutation.isPending && (
          <div className="flex items-start gap-2.5 mr-auto">
            <div className="w-7 h-7 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400">
              <Bot size={13} />
            </div>
            <div className="rounded-xl px-3.5 py-2.5 text-xs bg-stone-900/90 border border-stone-800 text-stone-300 flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400/40 border-t-amber-400 animate-spin" />
              <span className="font-mono text-[11px] text-amber-300">
                {model === "gemini-3.1-pro-preview"
                  ? "Gemini 3.1 Pro analyzing geotechnical parameters…"
                  : grounding === "search"
                  ? "Querying Google Search & synthesizing alerts…"
                  : grounding === "maps"
                  ? "Grounding spatial terrain and mountain passes in Google Maps…"
                  : "Gemini synthesizing response…"}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Account Gate Banner if unauthenticated */}
      {!isAuthenticated && (
        <div className="mx-4 mb-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-2 text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Lock size={13} className="text-amber-400 shrink-0" />
            <span>Google Account required to send queries to Gemini models.</span>
          </div>
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-[11px] transition-colors whitespace-nowrap"
          >
            Sign in
          </button>
        </div>
      )}

      {/* Input bar */}
      <div className="p-3 bg-stone-900/90 border-t border-stone-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={
              isAuthenticated
                ? `Ask ${ROLE_INFO[role].label} about slope stability, IMD alerts, or sensor diagnostics…`
                : "Connect your Google account to start chatting with Gemini AI…"
            }
            className="flex-1 bg-stone-950 border border-stone-700/80 rounded-lg px-3.5 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 font-sans"
          />

          <button
            type="submit"
            disabled={chatMutation.isPending || !inputQuery.trim()}
            className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-semibold text-xs transition-all disabled:opacity-40 flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            {chatMutation.isPending ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-stone-950 border-t-transparent animate-spin" />
            ) : (
              <>
                <span>SEND</span>
                <Send size={12} />
              </>
            )}
          </button>
        </form>
      </div>

      <GoogleAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          meQuery.refetch();
        }}
      />
    </div>
  );
};
