import { render, screen, fireEvent } from "@testing-library/react";
import { StudentDashboard } from "./dashboard";

describe("StudentDashboard integration", () => {
  test("renders planner dashboard and switches tabs", () => {
    render(<StudentDashboard />);

    expect(screen.getByText(/study planner/i)).toBeInTheDocument();

    const scheduleTab = screen.getByRole("button", { name: /schedule/i });
    fireEvent.click(scheduleTab);

    expect(scheduleTab).toHaveStyle({ borderBottom: "2px solid #4f46e5" });
  });

  test("adds a new task through the add task form", () => {
    render(<StudentDashboard />);

    fireEvent.change(screen.getByPlaceholderText(/e.g. Math/i), {
      target: { value: "Biology" },
    });
    fireEvent.change(screen.getByPlaceholderText(/e.g. Chapter 3/i), {
      target: { value: "Cell structure" },
    });
    fireEvent.change(screen.getByPlaceholderText(/e.g. 3/i), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByLabelText(/deadline/i), {
      target: { value: "2026-05-15" },
    });

    fireEvent.click(screen.getByRole("button", { name: /add task/i }));

    expect(screen.getByText(/cell structure/i)).toBeInTheDocument();
    expect(screen.getByText(/biology/i)).toBeInTheDocument();
  });

  test("marks a pending task complete and displays done state", () => {
    render(<StudentDashboard />);

    const completeButtons = screen.getAllByRole("button", { name: /mark complete/i });
    fireEvent.click(completeButtons[0]);

    expect(screen.getByText(/✓ done/i)).toBeInTheDocument();
  });
});
