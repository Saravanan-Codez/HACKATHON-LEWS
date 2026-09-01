export type UserQuota = {
  used: number;
  limit: number;
  remaining: number;
  isUnlimited: boolean;
  resetsInHours: number;
};

const DAILY_LIMIT_STANDARD_USER = 30;
const DAILY_LIMIT_OPERATOR_ADMIN = 500;

// In-memory store: Map<userKey, { count: number; dateStr: string }>
const usageStore = new Map<string, { count: number; dateStr: string }>();

function getTodayKey(): string {
  return new Date().toISOString().split("T")[0]; // YYYY-MM-DD UTC
}

function getHoursUntilMidnightUTC(): number {
  const now = new Date();
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const diffMs = midnight.getTime() - now.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
}

export function getUserQuota(userId: string | number, role: "user" | "admin" = "user"): UserQuota {
  const isUnlimited = role === "admin";
  const limit = isUnlimited ? DAILY_LIMIT_OPERATOR_ADMIN : DAILY_LIMIT_STANDARD_USER;
  const userKey = String(userId);
  const today = getTodayKey();

  const record = usageStore.get(userKey);
  let used = 0;
  if (record && record.dateStr === today) {
    used = record.count;
  }

  const remaining = isUnlimited ? 999 : Math.max(0, limit - used);

  return {
    used,
    limit,
    remaining,
    isUnlimited,
    resetsInHours: getHoursUntilMidnightUTC(),
  };
}

export function consumeUserQuota(
  userId: string | number,
  role: "user" | "admin" = "user"
): { allowed: boolean; quota: UserQuota; message?: string } {
  const currentQuota = getUserQuota(userId, role);

  if (!currentQuota.isUnlimited && currentQuota.remaining <= 0) {
    return {
      allowed: false,
      quota: currentQuota,
      message: `Daily AI intelligence query limit (${currentQuota.limit}/${currentQuota.limit}) reached. Quota resets in ${currentQuota.resetsInHours} hour(s) at midnight UTC. Contact emergency administration for elevated operator access.`,
    };
  }

  const userKey = String(userId);
  const today = getTodayKey();
  const record = usageStore.get(userKey);

  let newCount = 1;
  if (record && record.dateStr === today) {
    newCount = record.count + 1;
  }

  usageStore.set(userKey, { count: newCount, dateStr: today });

  const updatedQuota = getUserQuota(userId, role);
  return {
    allowed: true,
    quota: updatedQuota,
  };
}
