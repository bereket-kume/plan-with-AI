import { analyzeWorkload, generateSchedule, getPerformanceSummary, rescheduleMissed } from "./index";
import type { StudyTask } from "@plan-with-ai/utils";

describe("Feature-system scheduling engine", () => {
  const tasks: StudyTask[] = [
    {
      id: "1",
      subject: "Math",
      title: "Practice algebra",
      deadline: "2099-05-03",
      estimatedHours: 4,
      status: "pending",
      completedHours: 0,
    },
    {
      id: "2",
      subject: "History",
      title: "Read chapter 2",
      deadline: "2099-05-05",
      estimatedHours: 2,
      status: "pending",
      completedHours: 0,
    },
  ];

  test("analyzeWorkload returns daysRemaining, hoursRemaining, and loadLevel", () => {
    const analysis = analyzeWorkload(tasks);
    expect(analysis).toHaveLength(2);
    expect(analysis[0]).toEqual(expect.objectContaining({ task: tasks[0], hoursRemaining: 4 }));
    expect(["light", "moderate", "heavy"]).toContain(analysis[0].loadLevel);
  });

  test("generateSchedule prioritizes earliest deadline and distributes sessions across days", () => {
    const sessions = generateSchedule(tasks, "2026-05-01", 3);
    expect(sessions.map((s) => ({ date: s.date, taskId: s.taskId, durationHours: s.durationHours }))).toEqual([
      { date: "2026-05-01", taskId: "1", durationHours: 3 },
      { date: "2026-05-02", taskId: "1", durationHours: 1 },
      { date: "2026-05-02", taskId: "2", durationHours: 2 },
    ]);
  });

  test("generateSchedule ignores completed and overdue tasks", () => {
    const edgeTasks: StudyTask[] = [
      { id: "3", subject: "Chemistry", title: "Lab prep", deadline: "2026-04-01", estimatedHours: 2, status: "pending", completedHours: 0 },
      { id: "4", subject: "Biology", title: "Genetics", deadline: "2026-05-05", estimatedHours: 2, status: "completed", completedHours: 2 },
    ];
    expect(generateSchedule(edgeTasks, "2026-05-01", 3)).toEqual([]);
  });

  test("getPerformanceSummary computes completion and missed rates", () => {
    const summary = getPerformanceSummary([
      { date: "2026-05-01", plannedSessions: 3, completedSessions: 2, missedSessions: 1 },
      { date: "2026-05-02", plannedSessions: 2, completedSessions: 1, missedSessions: 1 },
    ]);

    expect(summary).toEqual({
      completionRate: 60,
      missedRate: 40,
      bestDay: "2026-05-01",
      totalPlanned: 5,
      totalCompleted: 3,
      totalMissed: 2,
    });
  });

  test("rescheduleMissed moves past missed sessions to future dates", () => {
    const sessions = [
      { taskId: "1", subject: "Math", title: "Practice algebra", date: "2026-05-01", startHour: 9, durationHours: 3 },
      { taskId: "2", subject: "History", title: "Read chapter 2", date: "2026-05-02", startHour: 9, durationHours: 2 },
    ];

    const result = rescheduleMissed(sessions, ["1"], "2026-05-03");
    expect(result).toEqual([
      { taskId: "2", subject: "History", title: "Read chapter 2", date: "2026-05-02", startHour: 9, durationHours: 2 },
      { taskId: "1", subject: "Math", title: "Practice algebra", date: "2026-05-03", startHour: 9, durationHours: 3 },
    ]);
  });
});
