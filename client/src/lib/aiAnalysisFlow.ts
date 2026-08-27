export function shouldRefreshAiAnalysis(input: { previousLevel: string | null; currentLevel: string; liveAvailable: boolean; demoMode: boolean }) {
  return input.liveAvailable && !input.demoMode && input.previousLevel !== input.currentLevel;
}
