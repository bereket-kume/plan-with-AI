import { formatGreeting } from "@plan-with-ai/utils";
import type {
  StudyTask,
  ScheduledSession,
  PerformanceRecord,
} from "@plan-with-ai/utils";
import {
  today,
  daysBetween,
  addDays,
  sortByDeadline,
  splitHoursAcrossDays,
  completionRate,
  missedRate,
  bestStudyDay,
  isOverdue,
} from "@plan-with-ai/utils";

export type {
  StudyTask,
  ScheduledSession,
  PerformanceRecord,
  TaskStatus,
} from "@plan-with-ai/utils";

/**
 * System-facing feature module (admin, configuration, etc.).
 */
export function getSystemGreeting(displayName: string): string {
  return `${formatGreeting(displayName)} · system`;
}

// ─── Workload Analysis ────────────────────────────────────────────────────────

export interface WorkloadAnalysis {
  task: StudyTask;
  daysRemaining: number;
  hoursRemaining: number;
  loadLevel: "light" | "moderate" | "heavy";
}

export function analyzeWorkload(tasks: StudyTask[]): WorkloadAnalysis[] {
  const t = today();
  return tasks
    .filter((task) => task.status !== "completed")
    .map((task) => {
      const daysRemaining = Math.max(0, daysBetween(t, task.deadline));
      const hoursRemaining = task.estimatedHours - task.completedHours;
      const ratio = daysRemaining === 0 ? Infinity : hoursRemaining / daysRemaining;
      const loadLevel: WorkloadAnalysis["loadLevel"] =
        ratio >= 4 ? "heavy" : ratio >= 2 ? "moderate" : "light";
      return { task, daysRemaining, hoursRemaining, loadLevel };
    });
}

// ─── Schedule Generator ───────────────────────────────────────────────────────

export function generateSchedule(
  tasks: StudyTask[],
  startDate: string = today(),
  dailyStudyHours: number = 3
): ScheduledSession[] {
  const sorted = sortByDeadline(
    tasks.filter((t) => t.status !== "completed" && !isOverdue(t.deadline))
  );

  const sessions: ScheduledSession[] = [];
  // Track hours already assigned per day
  const dayUsage: Record<string, number> = {};

  const assignHour = (date: string): number => {
    const used = dayUsage[date] ?? 0;
    return 9 + used; // start at 9:00 AM
  };

  for (const task of sorted) {
    const remaining = task.estimatedHours - task.completedHours;
    const daysAvailable = Math.max(1, daysBetween(startDate, task.deadline));
    const chunks = splitHoursAcrossDays(remaining, daysAvailable, dailyStudyHours);

    for (let i = 0; i < chunks.length; i++) {
      const date = addDays(startDate, i);
      const used = dayUsage[date] ?? 0;
      if (used >= dailyStudyHours) continue;

      const duration = Math.min(chunks[i], dailyStudyHours - used);
      sessions.push({
        taskId: task.id,
        subject: task.subject,
        title: task.title,
        date,
        startHour: assignHour(date),
        durationHours: duration,
      });
      dayUsage[date] = used + duration;
    }
  }

  return sessions.sort((a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour);
}

// ─── Performance Tracking ─────────────────────────────────────────────────────

export interface PerformanceSummary {
  completionRate: number;   // %
  missedRate: number;       // %
  bestDay: string | null;
  totalPlanned: number;
  totalCompleted: number;
  totalMissed: number;
}

export function getPerformanceSummary(
  records: PerformanceRecord[]
): PerformanceSummary {
  const totalPlanned = records.reduce((s, r) => s + r.plannedSessions, 0);
  const totalCompleted = records.reduce((s, r) => s + r.completedSessions, 0);
  const totalMissed = records.reduce((s, r) => s + r.missedSessions, 0);

  return {
    completionRate: completionRate(records),
    missedRate: missedRate(records),
    bestDay: bestStudyDay(records),
    totalPlanned,
    totalCompleted,
    totalMissed,
  };
}

/**
 * Auto-reschedule: take missed sessions and push them to future dates.
 * Returns updated sessions list.
 */
export function rescheduleMissed(
  sessions: ScheduledSession[],
  missedTaskIds: string[],
  fromDate: string = today()
): ScheduledSession[] {
  const kept = sessions.filter((s) => !missedTaskIds.includes(s.taskId) || s.date >= fromDate);
  const missed = sessions.filter(
    (s) => missedTaskIds.includes(s.taskId) && s.date < fromDate
  );

  // Push missed sessions to start from fromDate
  const rescheduled: ScheduledSession[] = missed.map((s, i) => ({
    ...s,
    date: addDays(fromDate, i),
    startHour: 9 + (i % 3),
  }));

  return [...kept, ...rescheduled].sort(
    (a, b) => a.date.localeCompare(b.date) || a.startHour - b.startHour
  );
}

