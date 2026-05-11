import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./button";

describe("Button component", () => {
  test("renders button text and responds to click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);

    expect(button).toBeInTheDocument();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
