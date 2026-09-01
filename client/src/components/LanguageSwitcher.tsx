/* Landsora High-Precision Regional Language Switcher Component */
import { useState, useRef, useEffect } from "react";
import { Compass, MapPin, Globe2, ChevronDown, Check } from "lucide-react";
import {
  notificationLanguages,
  detectLanguageForZone,
  type NotificationLanguage,
} from "@/lib/notificationTranslations";

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLangObj = notificationLanguages.find((l) => l.code === language) || notificationLanguages[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`header-lang-wrapper ${className}`} ref={dropdownRef}>
      {/* 1. Desktop Segmented Strip (Clean, high-contrast, zero-clipping) */}
      <div className="hidden lg:inline-flex items-center gap-1 bg-[#131D1F] border border-stone-700/80 p-1 rounded-lg shadow-inner box-border">
        {/* Auto Detect Button */}
        <button
          type="button"
          className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-bold transition-all ${
            autoDetectLanguage
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
              : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
          }`}
          onClick={() => {
            const next = !autoDetectLanguage;
            onAutoDetectToggle(next);
            if (next) {
              const autoLang = detectLanguageForZone(selectedZone);
              onLanguageChange(autoLang);
            }
          }}
          title={autoDetectLanguage ? "Auto-detection active (switches by focused mountain zone)" : "Enable automatic zone language detection"}
        >
          <Compass size={12} className={autoDetectLanguage ? "text-amber-400 animate-spin-slow" : "text-stone-400"} />
          <span>AUTO</span>
        </button>

        {/* GPS Button */}
        <button
          type="button"
          className="flex items-center gap-1 px-1.5 py-1 rounded text-[10px] font-mono text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 transition-colors"
          onClick={onDetectGpsLocation}
          title="Detect GPS location and switch language"
        >
          <MapPin size={11} className="text-emerald-400" />
          <span>GPS</span>
        </button>

        <span className="h-3.5 w-px bg-stone-700 mx-0.5" />

        {/* 6 Indic Language Pills */}
        {notificationLanguages.map((l) => {
          const isActive = language === l.code;
          return (
            <button
              key={l.code}
              type="button"
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10.5px] font-mono font-bold transition-all ${
                isActive
                  ? autoDetectLanguage
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "bg-amber-500 text-stone-950 font-extrabold shadow-md shadow-amber-500/20"
                  : "text-stone-300 hover:text-white hover:bg-stone-800/80"
              }`}
              onClick={() => {
                onAutoDetectToggle(false);
                onLanguageChange(l.code);
              }}
              title={`Switch language to ${l.label} (${l.nativeLabel})`}
            >
              <span>{l.code}</span>
              <span className="text-[10px] font-sans opacity-90 hidden xl:inline">
                {l.label.charAt(0) + l.label.slice(1).toLowerCase()}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Responsive Dropdown for Tablet & Mobile Screens */}
      <div className="inline-flex lg:hidden items-center relative">
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-[#141F22] border border-stone-700/90 text-stone-200 rounded-lg text-xs font-mono transition-all"
          aria-expanded={dropdownOpen}
        >
          <Globe2 size={13} className="text-amber-400" />
          <span className="font-bold text-amber-300">{activeLangObj.code}</span>
          <span className="font-sans text-xs text-stone-300">{activeLangObj.nativeLabel}</span>
          {autoDetectLanguage && (
            <span className="text-[8px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono">
              AUTO
            </span>
          )}
          <ChevronDown size={12} className={`text-stone-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-[#121A1C] border border-stone-700 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1 mb-1.5 border-b border-stone-800 flex items-center justify-between text-[9px] font-mono text-stone-400 uppercase">
              <span>Regional Language</span>
              <span>6 Languages</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 mb-2 pb-2 border-b border-stone-800">
              <button
                type="button"
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[9px] font-mono border transition-all ${
                  autoDetectLanguage
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                    : "bg-stone-900 border-stone-700 text-stone-300 hover:text-white"
                }`}
                onClick={() => {
                  const next = !autoDetectLanguage;
                  onAutoDetectToggle(next);
                  if (next) {
                    const autoLang = detectLanguageForZone(selectedZone);
                    onLanguageChange(autoLang);
                  }
                  setDropdownOpen(false);
                }}
              >
                <Compass size={11} /> AUTO DETECT
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[9px] font-mono bg-stone-900 border border-stone-700 text-stone-300 hover:text-white transition-all"
                onClick={() => {
                  onDetectGpsLocation();
                  setDropdownOpen(false);
                }}
              >
                <MapPin size={11} className="text-emerald-400" /> GPS LOCATE
              </button>
            </div>

            <div className="space-y-1">
              {notificationLanguages.map((l) => {
                const isSelected = language === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all ${
                      isSelected
                        ? "bg-amber-500/20 border border-amber-500/40 text-stone-100"
                        : "hover:bg-stone-800/80 text-stone-300"
                    }`}
                    onClick={() => {
                      onAutoDetectToggle(false);
                      onLanguageChange(l.code);
                      setDropdownOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-amber-400 w-6">
                        {l.code}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium font-sans text-stone-100">
                          {l.nativeLabel}
                        </span>
                        <span className="font-mono text-[8px] text-stone-400">
                          {l.label}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check size={13} className="text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
