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
      {/* Desktop / Wide Strip View */}
      <div className="hidden xl:inline-flex items-center gap-1 bg-[#141F22] border border-[#2B3B3F] p-[3px] rounded-[4px] shadow-sm box-border h-[32px]">
        {/* Auto Detect Button */}
        <button
          type="button"
          className={`lang-control-pill ${autoDetectLanguage ? "is-auto-active" : ""}`}
          onClick={() => {
            const next = !autoDetectLanguage;
            onAutoDetectToggle(next);
            if (next) {
              const autoLang = detectLanguageForZone(selectedZone);
              onLanguageChange(autoLang);
            }
          }}
          title={autoDetectLanguage ? "Auto-detection active based on focused zone" : "Enable automatic zone language detection"}
        >
          <Compass size={11} className={`flex-none ${autoDetectLanguage ? "text-amber-400 animate-spin [animation-duration:6s]" : "text-[#7E938B]"}`} />
          <span className="lang-code-tag">AUTO</span>
        </button>

        {/* GPS Button */}
        <button
          type="button"
          className="lang-control-pill"
          onClick={onDetectGpsLocation}
          title="Detect device GPS location and switch regional language"
        >
          <MapPin size={11} className="flex-none text-emerald-400" />
          <span className="lang-code-tag">GPS</span>
        </button>

        <span className="h-3.5 w-px bg-[#26373B] mx-0.5 self-center flex-none" />

        {/* 6 Regional Languages */}
        {notificationLanguages.map((l) => {
          const isActive = language === l.code;
          return (
            <button
              key={l.code}
              type="button"
              lang={l.code.toLowerCase()}
              className={`lang-option-pill ${isActive ? (autoDetectLanguage ? "is-auto-selected" : "is-active") : ""}`}
              onClick={() => {
                onAutoDetectToggle(false);
                onLanguageChange(l.code);
              }}
              title={`Switch notification language to ${l.label} (${l.nativeLabel})`}
            >
              <span className="lang-code-tag">{l.code}</span>
              <span className="lang-script-tag">{l.nativeLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Compact / Responsive Dropdown View for Medium & Small Screens */}
      <div className="flex xl:hidden items-center gap-1.5">
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          className="inline-flex items-center gap-2 px-2.5 h-[32px] bg-[#141F22] border border-[#2B3B3F] hover:border-[#4B5E63] text-[#E0EBE5] rounded-[3px] text-[9.5px] font-mono transition-all box-border"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          <Globe2 size={13} className="text-amber-400 flex-none" />
          <span className="font-semibold text-amber-200">{activeLangObj.code}</span>
          <span className="text-[#A5B8B0] font-sans text-xs">{activeLangObj.nativeLabel}</span>
          {autoDetectLanguage && (
            <span className="text-[7.5px] px-1 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono">
              AUTO
            </span>
          )}
          <ChevronDown size={12} className={`text-[#8EA098] transition-transform flex-none ${dropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-[#121A1C] border border-[#2D3F44] rounded-[4px] shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-2 py-1 mb-1.5 border-b border-[#243338] flex items-center justify-between text-[8px] font-mono text-[#8EA098] uppercase">
              <span>NOTIFICATION REGIONAL DIALECT</span>
              <span>6 INDIAN LANGUAGES</span>
            </div>

            {/* Quick Auto / GPS Action Row */}
            <div className="grid grid-cols-2 gap-1.5 mb-2 pb-2 border-b border-[#243338]">
              <button
                type="button"
                className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[2px] text-[8.5px] font-mono border transition-all ${
                  autoDetectLanguage
                    ? "bg-amber-400/20 border-amber-400/60 text-amber-200"
                    : "bg-[#162124] border-[#2B3B3F] text-[#A5B8B0] hover:text-white"
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
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-[2px] text-[8.5px] font-mono bg-[#162124] border border-[#2B3B3F] text-[#A5B8B0] hover:text-white transition-all"
                onClick={() => {
                  onDetectGpsLocation();
                  setDropdownOpen(false);
                }}
              >
                <MapPin size={11} className="text-emerald-400" /> GPS LOCATE
              </button>
            </div>

            {/* Language Selection List */}
            <div className="space-y-1">
              {notificationLanguages.map((l) => {
                const isSelected = language === l.code;
                return (
                  <button
                    key={l.code}
                    type="button"
                    lang={l.code.toLowerCase()}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[2px] text-left transition-all ${
                      isSelected
                        ? "bg-amber-400/15 border border-amber-400/50 text-[#F4EEDC]"
                        : "hover:bg-[#1A2629] text-[#BAC8C1]"
                    }`}
                    onClick={() => {
                      onAutoDetectToggle(false);
                      onLanguageChange(l.code);
                      setDropdownOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-[9px] font-bold text-amber-300 w-6">
                        {l.code}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-medium leading-tight font-sans text-[#F4EEDC]">
                          {l.nativeLabel}
                        </span>
                        <span className="font-mono text-[7.5px] text-[#7E938B]">
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
