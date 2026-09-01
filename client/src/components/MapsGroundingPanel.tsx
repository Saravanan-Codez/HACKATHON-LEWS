import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { MapPin, Navigation, Compass, ExternalLink, Lock, CheckCircle2, Route, Mountain } from "lucide-react";
import { GoogleAuthModal } from "./GoogleAuthModal";

type MapsGroundingPanelProps = {
  location?: string;
  language?: "EN" | "HI" | "TA" | "TE" | "KN" | "ML";
  onOpenGoogleAuth?: () => void;
};

const SUGGESTED_MAP_QUERIES = [
  "Identify highest risk mountain passes and ghat corridors near Kodagu and Hassan",
  "Locate emergency relief shelters and district hospitals near Wayanad landslide zone",
  "Evaluate alternate emergency bypass routes if Shiradi Ghat highway is blocked",
  "Check steep slope terrain elevation and drainage ravines near Idukki and Munnar",
];

export const MapsGroundingPanel: React.FC<MapsGroundingPanelProps> = ({
  location = "Kodagu, Western Ghats",
  language = "EN",
  onOpenGoogleAuth,
}) => {
  const meQuery = trpc.auth.me.useQuery();
  const isAuthenticated = Boolean(meQuery.data?.user);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [query, setQuery] = useState(`Analyze terrain elevation, mountain pass corridors, and emergency shelters around ${location}`);
  const [lastResult, setLastResult] = useState<{
    text: string;
    places: { title?: string; address?: string; placeId?: string }[];
    generatedAt: string;
  } | null>(null);

  const mapsMutation = trpc.grounding.maps.useMutation({
    onSuccess: (data) => {
      if ((data as any).requiresAuth) {
        if (onOpenGoogleAuth) onOpenGoogleAuth();
        else setAuthModalOpen(true);
        return;
      }
      setLastResult({
        text: data.text,
        places: data.places || [],
        generatedAt: data.generatedAt,
      });
    },
  });

  const handleGroundMaps = (customQuery?: string) => {
    const q = (customQuery || query).trim();
    if (!q || mapsMutation.isPending) return;

    if (!isAuthenticated) {
      if (onOpenGoogleAuth) onOpenGoogleAuth();
      else setAuthModalOpen(true);
      return;
    }

    if (customQuery) setQuery(customQuery);
    mapsMutation.mutate({
      location,
      query: q,
      language,
    });
  };

  return (
    <div className="maps-grounding-panel panel flex flex-col h-full bg-[#121619] border border-emerald-900/40 rounded-xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MapPin size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-stone-100 tracking-wide">
                GOOGLE MAPS GROUNDING
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                GEMINI-3.5-FLASH
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Grounded terrain topography, ghat passes & emergency shelter coordinates
            </p>
          </div>
        </div>

        {!isAuthenticated ? (
          <button
            type="button"
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-[11px] font-medium text-amber-300 hover:bg-amber-500/30 transition-colors"
          >
            <Lock size={11} /> Google Account Required
          </button>
        ) : (
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <CheckCircle2 size={12} /> MAPS ACTIVE
          </span>
        )}
      </div>

      {/* Query input */}
      <div className="mb-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGroundMaps()}
              placeholder="Query mountain passes, hospitals, emergency detour routes..."
              className="w-full bg-stone-950 border border-stone-700/80 rounded-lg pl-8 pr-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 font-sans"
            />
            <Compass size={13} className="absolute left-2.5 top-2.5 text-stone-400" />
          </div>

          <button
            type="button"
            onClick={() => handleGroundMaps()}
            disabled={mapsMutation.isPending}
            className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            {mapsMutation.isPending ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <Navigation size={12} />
                <span>GROUND MAPS</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggested Query Pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {SUGGESTED_MAP_QUERIES.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleGroundMaps(item)}
            className="text-[11px] px-2.5 py-1 rounded-md bg-stone-800/80 hover:bg-stone-700 border border-stone-700/60 text-stone-300 hover:text-emerald-300 transition-colors"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Result Display */}
      <div className="flex-1 overflow-y-auto rounded-lg bg-stone-950/70 border border-stone-800 p-3.5 min-h-[160px]">
        {mapsMutation.isPending ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-stone-400 space-y-2">
            <span className="w-5 h-5 rounded-full border-2 border-emerald-400/40 border-t-emerald-400 animate-spin" />
            <span className="text-xs font-mono text-emerald-300">
              Grounding terrain geometry and road corridors via Google Maps…
            </span>
          </div>
        ) : lastResult ? (
          <div className="space-y-3">
            <div className="text-xs leading-relaxed text-stone-200 whitespace-pre-wrap">
              {lastResult.text}
            </div>

            {/* Grounded Places */}
            {lastResult.places && lastResult.places.length > 0 && (
              <div className="pt-3 border-t border-stone-800/90">
                <div className="text-[11px] font-mono text-emerald-400 mb-1.5 flex items-center gap-1.5">
                  <MapPin size={11} /> GROUNDED GEOGRAPHIC HUBS & MOUNTAIN CORRIDORS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {lastResult.places.map((place, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-stone-900 border border-stone-800 text-[11px] text-emerald-300 flex items-start gap-1.5"
                    >
                      <MapPin size={12} className="shrink-0 mt-0.5 text-emerald-400" />
                      <div>
                        <div className="font-semibold text-stone-200">{place.title}</div>
                        {place.address && <div className="text-[10px] text-stone-400">{place.address}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-6 text-stone-500 text-xs">
            <Mountain size={20} className="mb-2 text-stone-600" />
            <span>Click 'GROUND MAPS' to evaluate terrain topography and road connectivity for {location}.</span>
          </div>
        )}
      </div>

      <GoogleAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => meQuery.refetch()}
      />
    </div>
  );
};
