import { useState } from "react";
import type { StudyTask } from "@plan-with-ai/utils";
import { today } from "@plan-with-ai/utils";
import {
  generateSchedule,
  analyzeWorkload,
  getPerformanceSummary,
  rescheduleMissed,
} from "../feature-system/src";
import type { ScheduledSession, PerformanceRecord } from "../feature-system/src";
import { Button } from "@plan-with-ai/ui-components";
import { Card } from "@plan-with-ai/ui-components";
import { ProgressBar } from "@plan-with-ai/ui-components";
import { Input } from "@plan-with-ai/ui-components";
import { formatDate } from "@plan-with-ai/utils";

// ─── Seed demo data ───────────────────────────────────────────────────────────

const DEMO_TASKS: StudyTask[] = [
  {
    id: "1",
    subject: "Math",
    title: "Algebra – Chapter 3",
    deadline: "2026-05-08",
    estimatedHours: 4,
    status: "pending",
    completedHours: 1,
  },
  {
    id: "2",
    subject: "Physics",
    title: "Mechanics – Wave Motion",
    deadline: "2026-05-10",
    estimatedHours: 3,
    status: "pending",
    completedHours: 0,
  },
  {
    id: "3",
    subject: "Chemistry",
    title: "Organic Chemistry – Reactions",
    deadline: "2026-05-12",
    estimatedHours: 5,
    status: "pending",
    completedHours: 2,
  },
];

const DEMO_RECORDS: PerformanceRecord[] = [
  { date: "2026-05-01", plannedSessions: 3, completedSessions: 3, missedSessions: 0 },
  { date: "2026-05-02", plannedSessions: 2, completedSessions: 1, missedSessions: 1 },
  { date: "2026-05-03", plannedSessions: 3, completedSessions: 2, missedSessions: 1 },
  { date: "2026-05-04", plannedSessions: 2, completedSessions: 2, missedSessions: 0 },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

function formatHour(h: number): string {
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:00 ${suffix}`;
}

function loadColor(level: string): string {
  if (level === "heavy") return "#ef4444";
  if (level === "moderate") return "#f59e0b";
  return "#22c55e";
}

// ─── Components ───────────────────────────────────────────────────────────────

export function StudentDashboard() {
  const [tasks, setTasks] = useState<StudyTask[]>(DEMO_TASKS);
  const [sessions, setSessions] = useState<ScheduledSession[]>(() =>
    generateSchedule(DEMO_TASKS)
  );
  const [records] = useState<PerformanceRecord[]>(DEMO_RECORDS);
  const [activeTab, setActiveTab] = useState<"tasks" | "schedule" | "performance">("tasks");

  // Add task form state
  const [form, setForm] = useState({
    subject: "",
    title: "",
    deadline: "",
    estimatedHours: "",
  });

  const handleAddTask = () => {
    if (!form.subject || !form.title || !form.deadline || !form.estimatedHours) return;
    const newTask: StudyTask = {
      id: Date.now().toString(),
      subject: form.subject,
      title: form.title,
      deadline: form.deadline,
      estimatedHours: Number(form.estimatedHours),
      status: "pending",
      completedHours: 0,
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    setSessions(generateSchedule(updated));
    setForm({ subject: "", title: "", deadline: "", estimatedHours: "" });
  };

  const handleComplete = (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id
        ? { ...t, status: "completed" as const, completedHours: t.estimatedHours }
        : t
    );
    setTasks(updated);
    setSessions(generateSchedule(updated));
  };

  const handleMissed = (taskId: string) => {
    setSessions((prev) => rescheduleMissed(prev, [taskId]));
  };

  const perf = getPerformanceSummary(records);
  const workload = analyzeWorkload(tasks);
  const todaySessions = sessions.filter((s) => s.date === today());
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const overdueCount = tasks.filter(
    (t) => t.status !== "completed" && new Date(t.deadline) < new Date()
  ).length;

  const tabStyle = (tab: string) => ({
    padding: "0.5rem 1.2rem",
    border: "none",
    borderBottom: activeTab === tab ? "2px solid #4f46e5" : "2px solid transparent",
    background: "none",
    cursor: "pointer",
    fontWeight: activeTab === tab ? 700 : 400,
    color: activeTab === tab ? "#4f46e5" : "#64748b",
    fontSize: "0.95rem",
  });

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 700, margin: "0 auto", padding: "1rem" }}>
      <h1 style={{ margin: "0 0 0.25rem", color: "#1e293b" }}>📚 Study Planner</h1>
      <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
        Today: <strong>{formatDate(today())}</strong>
      </p>

      {/* Stats Bar */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {[
          { label: "Total Tasks", value: tasks.length, color: "#4f46e5" },
          { label: "Completed", value: completedCount, color: "#22c55e" },
          { label: "Overdue", value: overdueCount, color: "#ef4444" },
          { label: "Completion Rate", value: `${perf.completionRate}%`, color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              flex: 1,
              minWidth: 130,
              background: "#f8fafc",
              border: `1px solid ${color}33`,
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "1.5rem", fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid #e2e8f0", marginBottom: "1.5rem", display: "flex" }}>
        <button style={tabStyle("tasks")} onClick={() => setActiveTab("tasks")}>Tasks</button>
        <button style={tabStyle("schedule")} onClick={() => setActiveTab("schedule")}>Schedule</button>
        <button style={tabStyle("performance")} onClick={() => setActiveTab("performance")}>Performance</button>
      </div>

      {/* ── TASKS TAB ── */}
      {activeTab === "tasks" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Add Task Form */}
          <Card title="Add New Task">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <Input label="Subject" placeholder="e.g. Math" value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <Input label="Task Title" placeholder="e.g. Chapter 3" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input label="Deadline" type="date" value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
              <Input label="Estimated Hours" type="number" min="0.5" step="0.5" placeholder="e.g. 3"
                value={form.estimatedHours}
                onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} />
            </div>
            <Button
              type="button"
              onClick={handleAddTask}
              style={{ marginTop: "0.75rem", background: "#4f46e5", color: "#fff", border: "none",
                borderRadius: "0.5rem", padding: "0.5rem 1.25rem", cursor: "pointer" }}
            >
              Add Task
            </Button>
          </Card>

          {/* Task List */}
          {tasks.map((task) => {
            const analysis = workload.find((w) => w.task.id === task.id);
            const progress = Math.round((task.completedHours / task.estimatedHours) * 100);
            return (
              <Card key={task.id}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", background: "#e0e7ff", color: "#4f46e5",
                      borderRadius: "9999px", padding: "0.1rem 0.6rem", marginBottom: "0.3rem", display: "inline-block" }}>
                      {task.subject}
                    </span>
                    <p style={{ margin: "0.25rem 0 0", fontWeight: 600 }}>{task.title}</p>
                    <p style={{ margin: "0.1rem 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                      Due: {formatDate(task.deadline)} · {task.estimatedHours}h total
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    {analysis && task.status !== "completed" && (
                      <span style={{ fontSize: "0.75rem", color: loadColor(analysis.loadLevel), fontWeight: 600 }}>
                        {analysis.loadLevel.toUpperCase()} LOAD
                      </span>
                    )}
                    {task.status === "completed" && (
                      <span style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 600 }}>✓ DONE</span>
                    )}
                  </div>
                </div>
                <div style={{ marginTop: "0.75rem" }}>
                  <ProgressBar value={progress} label={`Progress: ${task.completedHours}h / ${task.estimatedHours}h`} />
                </div>
                {task.status !== "completed" && (
                  <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.5rem" }}>
                    <Button type="button" onClick={() => handleComplete(task.id)}
                      style={{ fontSize: "0.8rem", background: "#22c55e", color: "#fff",
                        border: "none", borderRadius: "0.4rem", padding: "0.3rem 0.8rem", cursor: "pointer" }}>
                      Mark Complete
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* ── SCHEDULE TAB ── */}
      {activeTab === "schedule" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {todaySessions.length > 0 && (
            <Card title={`Today's Sessions (${formatDate(today())})`}>
              {todaySessions.map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "center", padding: "0.5rem 0",
                  borderBottom: i < todaySessions.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{formatHour(s.startHour)}</span>
                    {" – "}
                    <span>{formatHour(s.startHour + s.durationHours)}</span>
                    <span style={{ marginLeft: "0.75rem", color: "#4f46e5" }}>
                      {s.subject}: {s.title}
                    </span>
                  </div>
                  <Button type="button" onClick={() => handleMissed(s.taskId)}
                    style={{ fontSize: "0.75rem", background: "#fef3c7", color: "#92400e",
                      border: "1px solid #fcd34d", borderRadius: "0.4rem",
                      padding: "0.2rem 0.6rem", cursor: "pointer" }}>
                    Missed → Reschedule
                  </Button>
                </div>
              ))}
            </Card>
          )}

          {/* Full schedule grouped by date */}
          {Array.from(new Set(sessions.map((s) => s.date))).map((date) => (
            <Card key={date} title={formatDate(date)}>
              {sessions
                .filter((s) => s.date === date)
                .map((s, i, arr) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.4rem 0",
                    borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none" }}>
                    <span style={{ width: 90, fontSize: "0.85rem", color: "#64748b" }}>
                      {formatHour(s.startHour)}
                    </span>
                    <span style={{ flex: 1, fontSize: "0.9rem" }}>
                      <strong>{s.subject}</strong> — {s.title}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                      {s.durationHours}h
                    </span>
                  </div>
                ))}
            </Card>
          ))}
        </div>
      )}

      {/* ── PERFORMANCE TAB ── */}
      {activeTab === "performance" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Card title="Overall Performance">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <ProgressBar value={perf.completionRate} label="Completion Rate" color="#22c55e" />
              <ProgressBar value={perf.missedRate} label="Missed Rate" color="#ef4444" />
            </div>
            <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
              {[
                { label: "Planned", value: perf.totalPlanned, color: "#4f46e5" },
                { label: "Completed", value: perf.totalCompleted, color: "#22c55e" },
                { label: "Missed", value: perf.totalMissed, color: "#ef4444" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: "center", padding: "0.75rem",
                  background: "#f8fafc", borderRadius: "0.5rem" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 700, color }}>{value}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{label}</div>
                </div>
              ))}
            </div>
            {perf.bestDay && (
              <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#374151" }}>
                🏆 Best study day: <strong>{formatDate(perf.bestDay)}</strong>
              </p>
            )}
          </Card>

          {/* Per-day breakdown */}
          <Card title="Daily Breakdown">
            {records.map((r) => (
              <div key={r.date} style={{ padding: "0.6rem 0",
                borderBottom: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  marginBottom: "0.3rem" }}>
                  <span style={{ fontWeight: 500 }}>{formatDate(r.date)}</span>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    {r.completedSessions}/{r.plannedSessions} sessions
                  </span>
                </div>
                <ProgressBar
                  value={r.plannedSessions === 0 ? 0 : Math.round((r.completedSessions / r.plannedSessions) * 100)}
                  color={r.missedSessions > 0 ? "#f59e0b" : "#22c55e"}
                />
              </div>
            ))}
          </Card>

          {/* Insights */}
          <Card title="Insights">
            <ul style={{ margin: 0, paddingLeft: "1.2rem", lineHeight: 1.8, color: "#374151", fontSize: "0.9rem" }}>
              <li>
                You complete <strong>{perf.completionRate}%</strong> of your planned tasks.
              </li>
              <li>
                Missed sessions account for <strong>{perf.missedRate}%</strong> of your plan.
              </li>
              {perf.missedRate > 30 && (
                <li style={{ color: "#ef4444" }}>
                  ⚠️ High miss rate detected — consider reducing daily session count.
                </li>
              )}
              {perf.completionRate >= 80 && (
                <li style={{ color: "#22c55e" }}>
                  ✅ Great consistency! Keep it up.
                </li>
              )}
              {perf.bestDay && (
                <li>
                  Your most productive day was <strong>{formatDate(perf.bestDay)}</strong>.
                </li>
              )}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}
