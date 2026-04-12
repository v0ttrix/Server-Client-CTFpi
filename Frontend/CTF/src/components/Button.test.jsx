import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Button } from "./Button";

describe("Button Component", () => {
  it("renders as a button by default", () => {
    render(<Button>Click Me</Button>);
    const button = screen.getByRole("button", { name: /Click Me/i });
    expect(button).toBeInTheDocument();
    expect(button.tagName.toLowerCase()).toBe("button");
  });

  it("renders as a Link when 'to' prop is provided", () => {
    render(
      <BrowserRouter>
        <Button to="/home">Go Home</Button>
      </BrowserRouter>,
    );
    const link = screen.getByRole("link", { name: /Go Home/i });
    expect(link).toBeInTheDocument();
    expect(link.tagName.toLowerCase()).toBe("a");
    expect(link).toHaveAttribute("href", "/home");
  });

  it("applies passed className along with base classes", () => {
    render(<Button className="custom-class">Custom Button</Button>);
    const button = screen.getByRole("button", { name: /Custom Button/i });
    expect(button).toHaveClass("custom-class");
    expect(button).toHaveClass("bg-white"); // checking one of the base classes
  });

  it("passes other props correctly", () => {
    render(
      <Button disabled data-testid="my-btn">
        Disabled Btn
      </Button>,
    );
    const button = screen.getByTestId("my-btn");
    expect(button).toBeDisabled();
  });
});
