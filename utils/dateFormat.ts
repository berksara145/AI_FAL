import i18n from "../lib/i18n";

/** Format a numeric birth date as "D Mon YYYY". Returns `fallback` if any part is missing. */
export function formatDate(
  year: number | null,
  month: number | null,
  day: number | null,
  fallback: string
): string {
  if (!year || !month || !day) return fallback;
  const months = i18n.t("months.short", { returnObjects: true }) as string[];
  return `${day} ${months[month - 1]} ${year}`;
}

/** Format numeric hour/minute as "HH:MM". Returns `fallback` if either is null. */
export function formatTime(
  hour: number | null,
  minute: number | null,
  fallback: string
): string {
  if (hour == null || minute == null) return fallback;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Human-readable relative time string — e.g. "3h ago", "2d ago". */
export function timeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

/** Group label for a date: "Today", "Yesterday", "This Week", "This Month", "Older". */
export function dateBucket(iso: string): string {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const itemStart = new Date(
      new Date(iso).getFullYear(),
      new Date(iso).getMonth(),
      new Date(iso).getDate()
    );
    const days = Math.round((todayStart.getTime() - itemStart.getTime()) / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return "This Week";
    if (days < 30) return "This Month";
    return "Older";
  } catch {
    return "Older";
  }
}
