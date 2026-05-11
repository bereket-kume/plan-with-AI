import { render, screen } from "@testing-library/react";
import { ProgressBar } from "./progress-bar";

describe("ProgressBar component", () => {
  test("renders label and clamps values between 0 and 100", () => {
    render(<ProgressBar value={120} label="Progress" color="#22c55e" />);

    expect(screen.getByText(/progress/i)).toBeInTheDocument();
    expect(screen.getByText("100%")) .toBeInTheDocument();
  });
});
