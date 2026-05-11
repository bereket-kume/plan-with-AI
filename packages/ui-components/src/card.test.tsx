import { render, screen } from "@testing-library/react";
import { Card } from "./card";

describe("Card component", () => {
  test("renders title and children correctly", () => {
    render(
      <Card title="Task Card">
        <span>Child content</span>
      </Card>,
    );

    expect(screen.getByText(/task card/i)).toBeInTheDocument();
    expect(screen.getByText(/child content/i)).toBeInTheDocument();
  });
});
