/* Landsora Google Translate Language Switcher Dropdown */
import React, { useState, useRef, useEffect, useMemo } from "react";
import { Compass, MapPin, Search, ChevronDown, Check, Sparkles, X } from "lucide-react";
import {
  notificationLanguages,
  detectLanguageForZone,
  type NotificationLanguage,
} from "@/lib/notificationTranslations";

// Google Translate "文/A" SVG Icon
export function GoogleTranslateIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  );
}

interface LanguageSwitcherProps {
  language: NotificationLanguage;
  autoDetectLanguage: boolean;
  onLanguageChange: (lang: NotificationLanguage) => void;
  onAutoDetectToggle: (auto: boolean) => void;
  onDetectGpsLocation: () => void;
  selectedZone: string;
  className?: string;
}

export function LanguageSwitcher({
  language,
  autoDetectLanguage,
  onLanguageChange,
  onAutoDetectToggle,
  onDetectGpsLocation,
  selectedZone,
  className = "",
}: LanguageSwitcherProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "INDIAN" | "GLOBAL">("ALL");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLangObj = useMemo(
    () => notificationLanguages.find((l) => l.code === language) || notificationLanguages[0],
    [language]
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLanguages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return notificationLanguages.filter((l) => {
      const matchesTab =
        activeTab === "ALL" ||
        (activeTab === "INDIAN" && l.group === "Indian & Asian") ||
        (activeTab === "GLOBAL" && l.group === "Global & European");

      if (!matchesTab) return false;
      if (!q) return true;

      return (
        l.code.toLowerCase().includes(q) ||
        l.label.toLowerCase().includes(q) ||
        l.nativeLabel.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, activeTab]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* 1. Main Google Translate Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-900/95 hover:bg-stone-850 border border-stone-700/80 hover:border-amber-500/50 shadow-md transition-all text-stone-200 group"
        title="Google Translate — Select Language"
      >
        <div className="flex items-center justify-center w-5 h-5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/40 group-hover:scale-105 transition-transform">
          <GoogleTranslateIcon className="w-3.5 h-3.5 text-blue-400" />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-base leading-none">{"flag" in activeLangObj ? (activeLangObj as any).flag : "🌐"}</span>
          <span className="font-bold text-amber-300">{activeLangObj.code}</span>
          <span className="hidden sm:inline text-stone-300 font-sans font-medium text-xs">
            {activeLangObj.nativeLabel}
          </span>
          {autoDetectLanguage && (
            <span className="text-[9px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 px-1 rounded ml-0.5">
              AUTO
            </span>
          )}
        </div>

        <ChevronDown
          size={14}
          className={`text-stone-400 group-hover:text-amber-400 transition-transform duration-200 ${
            dropdownOpen ? "rotate-180 text-amber-400" : ""
          }`}
        />
      </button>

      {/* 2. Google Translate Dropdown Modal */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-stone-950/98 backdrop-blur-xl border border-stone-700/90 shadow-2xl z-[10000] overflow-hidden flex flex-col max-h-[480px] animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3 border-b border-stone-800/90 bg-stone-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30">
                  <GoogleTranslateIcon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-100 font-mono tracking-wide uppercase flex items-center gap-1.5">
                    <span>Google Translate</span>
                    <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-1 py-0.2 rounded font-sans font-normal">
                      Live
                    </span>
                  </h4>
                  <p className="text-[10px] text-stone-400">Universal Multi-Language Engine</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDropdownOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-md hover:bg-stone-800"
              >
                <X size={14} />
              </button>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search languages (e.g., Kannada, Spanish, বাংলা)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-stone-900 border border-stone-700/80 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-amber-500/80 font-sans"
                autoFocus
              />
            </div>

            {/* Quick Auto / GPS Actions & Category Tabs */}
            <div className="flex items-center justify-between gap-1 pt-1">
              <div className="flex items-center gap-1">
                {(["ALL", "INDIAN", "GLOBAL"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all ${
                      activeTab === tab
                        ? "bg-amber-500 text-stone-950 shadow-sm"
                        : "text-stone-400 hover:text-stone-200 hover:bg-stone-850"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const next = !autoDetectLanguage;
                    onAutoDetectToggle(next);
                    if (next) {
                      const autoLang = detectLanguageForZone(selectedZone);
                      onLanguageChange(autoLang);
                      setDropdownOpen(false);
                    }
                  }}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono transition-all ${
                    autoDetectLanguage
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "text-stone-400 hover:text-stone-200 bg-stone-900 border border-stone-800"
                  }`}
                  title="Auto-detect based on monitored mountain zone"
                >
                  <Compass size={11} className={autoDetectLanguage ? "animate-spin-slow text-emerald-400" : ""} />
                  <span>ZONE AUTO</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onDetectGpsLocation();
                    setDropdownOpen(false);
                  }}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-stone-400 hover:text-stone-200 bg-stone-900 border border-stone-800 hover:border-stone-700"
                  title="Detect GPS coordinates"
                >
                  <MapPin size={11} className="text-emerald-400" />
                  <span>GPS</span>
                </button>
              </div>
            </div>
          </div>

          {/* Language List */}
          <div className="overflow-y-auto p-2 space-y-1 divide-y divide-stone-900/60 max-h-[300px]">
            {filteredLanguages.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-500 font-mono">
                No languages matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              filteredLanguages.map((item) => {
                const isSelected = language === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      onAutoDetectToggle(false);
                      onLanguageChange(item.code);
                      setDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? "bg-amber-500/15 border border-amber-500/40 text-amber-200 shadow-sm"
                        : "hover:bg-stone-900 text-stone-300 hover:text-stone-100"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-lg leading-none shrink-0">
                        {"flag" in item ? (item as any).flag : "🌐"}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-stone-100 font-sans truncate">
                            {item.nativeLabel}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-400/90 shrink-0">
                            {item.code}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400 font-sans truncate">
                          {item.label} &middot; <span className="text-stone-500">{item.group}</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-sm">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      ) : (
                        <span className="text-[9px] font-mono text-stone-500 group-hover:text-stone-300">
                          GT
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-stone-800/90 bg-stone-900/50 flex items-center justify-between text-[10px] text-stone-400 font-mono px-3">
            <span className="flex items-center gap-1">
              <Sparkles size={11} className="text-amber-400" />
              <span>{notificationLanguages.length} Languages Supported</span>
            </span>
            <span className="text-stone-500">Google Cloud Neural MT</span>
          </div>
        </div>
      )}
    </div>
  );
}
