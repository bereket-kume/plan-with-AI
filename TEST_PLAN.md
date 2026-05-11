# AI-Based Study Planner System Test Plan

## Overview

This test plan covers the monorepo with:

- unit tests for shared utils and scheduling logic
- component tests for reusable UI components
- feature tests for task creation, progress tracking, schedule/calendar behavior
- integration tests for planner workflow
- edge cases and validation conditions

Recommended stack:

- Jest
- React Testing Library
- Playwright or Cypress for future end-to-end coverage

---

## 1. Unit tests: utils and scheduling engine

### `packages/utils/src/index.test.ts`

- Test name: `formatGreeting returns a personalized greeting`
  - Scenario: non-empty trimmed name
  - Input: `"  Maya "`
  - Expected output: `"Hello, Maya"`
  - Edge case: whitespace-only input returns `"Hello"`

- Test name: `daysBetween computes calendar day span correctly`
  - Scenario: same-day and multi-day intervals
  - Input: `"2026-05-01"`, `"2026-05-03"`
  - Expected output: `2`

- Test name: `addDays adds calendar days correctly`
  - Scenario: adding calendar days across month boundaries
  - Input: `"2026-02-27"`, `2`
  - Expected output: `"2026-03-01"`

- Test name: `sortByDeadline orders soonest deadlines first`
  - Scenario: task sorting by deadline string
  - Input: unsorted array of tasks
  - Expected output: sorted IDs by deadline ascending

- Test name: `splitHoursAcrossDays divides study workload into chunks`
  - Scenario: total hours, days available, and daily capacity
  - Input: `7`, `3`
  - Expected output: `[3, 3, 1]`
  - Edge case: zero available days returns full total as one chunk

- Test name: `completionRate and missedRate return correct percentages`
  - Scenario: planned/completed/missed session totals
  - Input: records arrays
  - Expected output: `60%`, `40%`, and `0` for empty data

- Test name: `bestStudyDay returns date with highest completed sessions`
  - Scenario: choose the date with the maximum completed count
  - Input: records with varying completedSessions
  - Expected output: highest-value date or `null` when no records

- Test name: `isOverdue returns false for distant future deadlines`
  - Scenario: far-future deadline should not be overdue
  - Input: `"2099-01-01"`
  - Expected output: `false`

---

## 2. Scheduling engine tests

### `packages/feature-system/src/index.test.ts`

- Test name: `analyzeWorkload returns load classification`
  - Scenario: pending tasks with different deadlines and hours
  - Input: study tasks array
  - Expected output: workload objects with `daysRemaining`, `hoursRemaining`, and `light|moderate|heavy`

- Test name: `generateSchedule prioritizes earliest deadline and distributes sessions`
  - Scenario: two tasks scheduled from a fixed start date
  - Input: tasks due on `2099-05-03` and `2099-05-05`, daily capacity 3
  - Expected output: sessions assigned to earlier task first, with overflow split to the next date

- Test name: `generateSchedule ignores completed and overdue tasks`
  - Scenario: completed tasks and past deadlines are excluded from new schedules
  - Input: completed item and overdue item
  - Expected output: empty schedule list

- Test name: `getPerformanceSummary aggregates performance correctly`
  - Scenario: mix of completed and missed sessions
  - Input: performance records
  - Expected output: completion rate, missed rate, best day, totals

- Test name: `rescheduleMissed pushes missed sessions to future dates`
  - Scenario: a missed session before `fromDate`
  - Input: current sessions and missed task IDs
  - Expected output: missed sessions moved to `fromDate` and beyond

---

## 3. Component tests

### `packages/ui-components/src/button.test.tsx`

- Test name: `Button renders children and triggers clicks`
  - Scenario: button component with `onClick`
  - Input: render `Button` with label and handler
  - Expected output: button exists and handler called once

### `packages/ui-components/src/card.test.tsx`

- Test name: `Card displays title and child content`
  - Scenario: card wrapper renders header and nested children
  - Expected output: title and child text visible

### `packages/ui-components/src/progress-bar.test.tsx`

- Test name: `ProgressBar clamps values and renders label`
  - Scenario: value above 100
  - Expected output: label visible and `100%` displayed

---

## 4. Feature / integration tests

### `packages/feature-student/src/dashboard.test.tsx`

- Test name: `StudentDashboard renders core planner UI`
  - Scenario: initial app load
  - Expected output: planner title and tab buttons visible

- Test name: `adds a new task through the task form`
  - Scenario: user fills new task form and submits
  - Input: subject, title, deadline, estimated hours
  - Expected output: new task appears in task list

- Test name: `marks a task complete and updates task state`
  - Scenario: click `Mark Complete` on a pending task
  - Expected output: task displays completed state (`✓ DONE`)

- Test name: `switches tab state between tasks and schedule`
  - Scenario: click the schedule tab
  - Expected output: schedule tab becomes active

---

## 5. Edge cases and validation scenarios

- Missing required fields in task creation form should leave the new task out of the list
- Task deadlines earlier than today should be considered overdue and not scheduled
- Projects with more hours than daily capacity should distribute sessions across multiple days
- Completed tasks should be excluded from future schedule generation
- Missed sessions should be re-assigned to the next available future day
- Progress values above 100 should clamp to `100%`

---

## 6. Future end-to-end coverage

For full workflow validation, add a Playwright or Cypress suite that covers:

- creating a task via the UI and confirming it appears in the planner
- completing a task and verifying progress updates
- marking a scheduled session as missed and checking rescheduling behavior
- validating the calendar view and workload summary after updates
- ensuring date-based prioritization is reflected in the schedule

Use `npm test` to run the current Jest suite after dependencies are installed.
