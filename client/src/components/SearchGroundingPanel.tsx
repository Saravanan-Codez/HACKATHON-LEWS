import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Search, Globe, ExternalLink, Sparkles, Lock, RefreshCw, CheckCircle2 } from "lucide-react";
import { GoogleAuthModal } from "./GoogleAuthModal";

type SearchGroundingPanelProps = {
  location?: string;
  language?: string;
  onOpenGoogleAuth?: () => void;
};

const SUGGESTED_SEARCHES = [
  "Latest IMD red alerts and monsoonal rainfall bulletins for Western Ghats",
  "Geological Survey of India landslide warning status today",
  "National Highway mountain pass road closures and landslide blockages",
  "Central Water Commission (CWC) flash flood advisory Karnataka and Kerala",
];

export const SearchGroundingPanel: React.FC<SearchGroundingPanelProps> = ({
  location = "Kodagu, Western Ghats",
  language = "EN",
  onOpenGoogleAuth,
}) => {
  const meQuery = trpc.auth.me.useQuery();
  const isAuthenticated = Boolean(meQuery.data?.user);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [query, setQuery] = useState(`Current landslide warnings and IMD rainfall forecast for ${location}`);
  const [lastResult, setLastResult] = useState<{
    text: string;
    sources: { title: string; url: string }[];
    searchQueries?: string[];
    generatedAt: string;
  } | null>(null);

  const searchMutation = trpc.grounding.search.useMutation({
    onSuccess: (data) => {
      if ((data as any).requiresAuth) {
        if (onOpenGoogleAuth) onOpenGoogleAuth();
        else setAuthModalOpen(true);
        return;
      }
      setLastResult({
        text: data.text,
        sources: data.sources || [],
        searchQueries: (data as any).searchQueries || [],
        generatedAt: data.generatedAt,
      });
    },
  });

  const handleSearch = (customQuery?: string) => {
    const q = (customQuery || query).trim();
    if (!q || searchMutation.isPending) return;

    if (!isAuthenticated) {
      if (onOpenGoogleAuth) onOpenGoogleAuth();
      else setAuthModalOpen(true);
      return;
    }

    if (customQuery) setQuery(customQuery);
    searchMutation.mutate({
      query: q,
      location,
      language,
    });
  };

  return (
    <div className="search-grounding-panel panel flex flex-col h-full bg-[#121619] border border-blue-900/40 rounded-xl p-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Search size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-stone-100 tracking-wide">
                GOOGLE SEARCH GROUNDING
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30">
                GEMINI-3.5-FLASH
              </span>
            </div>
            <p className="text-[11px] text-stone-400">
              Live meteorological bulletins & official disaster alerts with citations
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
            <CheckCircle2 size={12} /> SEARCH ACTIVE
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
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search live IMD rainfall warnings, road blockages..."
              className="w-full bg-stone-950 border border-stone-700/80 rounded-lg pl-8 pr-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 font-sans"
            />
            <Search size={13} className="absolute left-2.5 top-2.5 text-stone-400" />
          </div>

          <button
            type="button"
            onClick={() => handleSearch()}
            disabled={searchMutation.isPending}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            {searchMutation.isPending ? (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <Globe size={12} />
                <span>GROUND</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggested Search Pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {SUGGESTED_SEARCHES.map((item, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleSearch(item)}
            className="text-[11px] px-2.5 py-1 rounded-md bg-stone-800/80 hover:bg-stone-700 border border-stone-700/60 text-stone-300 hover:text-blue-300 transition-colors"
          >
            {item}
          </button>
        ))}
      </div>

      {/* Result Display */}
      <div className="flex-1 overflow-y-auto rounded-lg bg-stone-950/70 border border-stone-800 p-3.5 min-h-[160px]">
        {searchMutation.isPending ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-stone-400 space-y-2">
            <span className="w-5 h-5 rounded-full border-2 border-blue-400/40 border-t-blue-400 animate-spin" />
            <span className="text-xs font-mono text-blue-300">
              Querying Google Search & synthesizing grounded intelligence…
            </span>
          </div>
        ) : lastResult ? (
          <div className="space-y-3">
            <div className="text-xs leading-relaxed text-stone-200 whitespace-pre-wrap">
              {lastResult.text}
            </div>

            {/* Citations & Sources */}
            {lastResult.sources && lastResult.sources.length > 0 && (
              <div className="pt-3 border-t border-stone-800/90">
                <div className="text-[11px] font-mono text-blue-400 mb-1.5 flex items-center gap-1.5">
                  <Globe size={11} /> VERIFIED WEB CITATIONS & REPORTS
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {lastResult.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded bg-stone-900 border border-stone-800 hover:border-blue-700/60 text-[11px] text-blue-300 hover:text-blue-200 flex items-start gap-1.5 transition-all group"
                    >
                      <ExternalLink size={12} className="shrink-0 mt-0.5 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span className="truncate">{src.title || src.url}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-6 text-stone-500 text-xs">
            <Globe size={20} className="mb-2 text-stone-600" />
            <span>Click 'GROUND' to retrieve verified Google Search alerts for {location}.</span>
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
