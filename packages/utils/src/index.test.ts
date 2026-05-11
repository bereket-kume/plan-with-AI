import {
  formatGreeting,
  daysBetween,
  addDays,
  sortByDeadline,
  splitHoursAcrossDays,
  completionRate,
  missedRate,
  bestStudyDay,
  isOverdue,
} from "./index";

describe("Utils module", () => {
  test("formatGreeting returns a personalized greeting when name is non-empty", () => {
    expect(formatGreeting("  Maya ")).toBe("Hello, Maya");
  });

  test("formatGreeting returns default greeting for empty input", () => {
    expect(formatGreeting("   ")).toBe("Hello");
  });

  test("daysBetween computes calendar day span correctly", () => {
    expect(daysBetween("2026-05-01", "2026-05-03")).toBe(2);
    expect(daysBetween("2026-05-01", "2026-05-01")).toBe(0);
  });

  test("addDays adds calendar days correctly", () => {
    expect(addDays("2026-05-01", 5)).toBe("2026-05-06");
    expect(addDays("2026-02-27", 2)).toBe("2026-03-01");
  });

  test("sortByDeadline orders tasks by soonest deadline first", () => {
    const tasks = [
      { id: "1", deadline: "2026-05-10" },
      { id: "2", deadline: "2026-05-05" },
      { id: "3", deadline: "2026-05-07" },
    ] as const;

    expect(sortByDeadline(tasks).map((task) => task.id)).toEqual(["2", "3", "1"]);
  });

  test("splitHoursAcrossDays divides available hours into daily chunks", () => {
    expect(splitHoursAcrossDays(7, 3)).toEqual([3, 3, 1]);
    expect(splitHoursAcrossDays(2, 5)).toEqual([2]);
    expect(splitHoursAcrossDays(5, 0)).toEqual([5]);
  });

  test("completionRate calculates percent of completed sessions", () => {
    expect(
      completionRate([
        { date: "2026-05-01", plannedSessions: 3, completedSessions: 2, missedSessions: 1 },
        { date: "2026-05-02", plannedSessions: 2, completedSessions: 2, missedSessions: 0 },
      ]),
    ).toBe(80);
    expect(completionRate([])).toBe(0);
  });

  test("missedRate calculates percent of missed sessions", () => {
    expect(
      missedRate([
        { date: "2026-05-01", plannedSessions: 3, completedSessions: 2, missedSessions: 1 },
        { date: "2026-05-02", plannedSessions: 2, completedSessions: 1, missedSessions: 1 },
      ]),
    ).toBe(40);
    expect(missedRate([])).toBe(0);
  });

  test("bestStudyDay returns the date with the most completed sessions", () => {
    expect(
      bestStudyDay([
        { date: "2026-05-01", plannedSessions: 3, completedSessions: 3, missedSessions: 0 },
        { date: "2026-05-02", plannedSessions: 2, completedSessions: 1, missedSessions: 1 },
      ]),
    ).toBe("2026-05-01");
    expect(bestStudyDay([])).toBeNull();
  });

  test("isOverdue returns false for a far-future deadline", () => {
    expect(isOverdue("2099-01-01")).toBe(false);
  });
});
