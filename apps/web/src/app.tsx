import {
  getStudentGreeting,
  StudentActionsBar,
} from "@plan-with-ai/feature-student";
import { getSystemGreeting } from "@plan-with-ai/feature-system";
import { Button } from "@plan-with-ai/ui-components";
import { formatGreeting } from "@plan-with-ai/utils";
import Dashboard from '../../../packages/feature-student/src/pages/Dashboardpage';
import './styles.css';

export function App() {
  return (
    <main>
      <Dashboard />
    </main>
  );
}
