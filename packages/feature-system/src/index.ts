import { formatGreeting } from "@plan-with-ai/utils";

/**
 * System-facing feature module (admin, configuration, etc.).
 */
export function getSystemGreeting(displayName: string): string {
  return `${formatGreeting(displayName)} · system`;
}
