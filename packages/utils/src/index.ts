/**
 * Shared helpers used across apps and feature packages.
 */
export function formatGreeting(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? `Hello, ${trimmed}` : "Hello";
}

// ─── Shared Domain Types ──────────────────────────────────────────────────────

export type TaskStatus = "pending" | "completed" | "missed" | "overdue";

export interface StudyTask {
  id: string;
  subject: string;
  title: string;
  deadline: string; // ISO date string yyyy-mm-dd
  estimatedHours: number;
  status: TaskStatus;
  completedHours: number;
}

export interface ScheduledSession {
  taskId: string;
  subject: string;
  title: string;
  date: string; // yyyy-mm-dd
  startHour: number; // 0-23
  durationHours: number;
}

export interface PerformanceRecord {
  date: string; // yyyy-mm-dd
  plannedSessions: number;
  completedSessions: number;
  missedSessions: number;
}

// ─── Date Utilities ───────────────────────────────────────────────────────────

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  const a = new Date(from).getTime();
  const b = new Date(to).getTime();
  return Math.ceil((b - a) / (1000 * 60 * 60 * 24));
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function isOverdue(deadline: string): boolean {
  return daysBetween(today(), deadline) < 0;
}

// ─── Scheduling Utilities ─────────────────────────────────────────────────────

/** Sort tasks: soonest deadline first */
export function sortByDeadline(tasks: StudyTask[]): StudyTask[] {
  return [...tasks].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );
}

/** Split task hours evenly across available days */
export function splitHoursAcrossDays(
  totalHours: number,
  days: number,
  hoursPerDay: number = 3
): number[] {
  if (days <= 0) return [totalHours];
  const slots: number[] = [];
  let remaining = totalHours;
  for (let i = 0; i < days && remaining > 0; i++) {
    const chunk = Math.min(hoursPerDay, remaining);
    slots.push(chunk);
    remaining -= chunk;
  }
  return slots;
}

// ─── Performance Utilities ────────────────────────────────────────────────────

export function completionRate(records: PerformanceRecord[]): number {
  const totalPlanned = records.reduce((s, r) => s + r.plannedSessions, 0);
  const totalCompleted = records.reduce((s, r) => s + r.completedSessions, 0);
  if (totalPlanned === 0) return 0;
  return Math.round((totalCompleted / totalPlanned) * 100);
}

export function missedRate(records: PerformanceRecord[]): number {
  const totalPlanned = records.reduce((s, r) => s + r.plannedSessions, 0);
  const totalMissed = records.reduce((s, r) => s + r.missedSessions, 0);
  if (totalPlanned === 0) return 0;
  return Math.round((totalMissed / totalPlanned) * 100);
}

/** Returns the date string with the most completed sessions */
export function bestStudyDay(records: PerformanceRecord[]): string | null {
  if (records.length === 0) return null;
  return records.reduce((best, r) =>
    r.completedSessions > best.completedSessions ? r : best
  ).date;
}
