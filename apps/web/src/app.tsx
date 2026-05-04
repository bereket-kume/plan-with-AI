import {
  getStudentGreeting,
  StudentActionsBar,
} from "@plan-with-ai/feature-student";
import { getSystemGreeting } from "@plan-with-ai/feature-system";
import { Button } from "@plan-with-ai/ui-components";
import { formatGreeting } from "@plan-with-ai/utils";

export function App() {
  return (
    <main className="layout">
      <header className="header">
        <h1>plan-with-AI</h1>
        <p className="muted">Turborepo monorepo · apps/web</p>
      </header>

      <section className="card">
        <h2>Packages</h2>
        <ul className="list">
          <li>
            <strong>@plan-with-ai/utils</strong> — {formatGreeting("you")}
          </li>
          <li>
            <strong>@plan-with-ai/feature-student</strong> —{" "}
            {getStudentGreeting("Alex")}
          </li>
          <li>
            <strong>@plan-with-ai/feature-system</strong> —{" "}
            {getSystemGreeting("Jordan")}
          </li>
        </ul>
        <div className="row">
          <Button type="button">@plan-with-ai/ui-components</Button>
        </div>
        <StudentActionsBar />
      </section>
    </main>
  );
}
