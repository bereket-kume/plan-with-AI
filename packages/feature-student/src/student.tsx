import { formatGreeting } from "@plan-with-ai/utils";
import { Button } from "@plan-with-ai/ui-components";

/**
 * Student-facing feature module (courses, progress, etc.).
 */
export function getStudentGreeting(displayName: string): string {
  return `${formatGreeting(displayName)} · student`;
}

export function StudentActionsBar() {
  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <Button type="button">Student action</Button>
    </div>
  );
}
