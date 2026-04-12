import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BGPattern } from "./bg-pattern";

describe("BGPattern Component", () => {
  it("renders with default props", () => {
    const { container } = render(<BGPattern />);
    const div = container.firstChild;
    expect(div).toHaveClass("absolute");
    expect(div).toHaveClass("inset-0");
    expect(div).toHaveStyle("background-size: 24px 24px");
  });

  it("renders 'dots' variant correctly", () => {
    const { container } = render(<BGPattern variant="dots" />);
    const div = container.firstChild;
    expect(div).toHaveStyle(
      "background-image: radial-gradient(#252525 1px, transparent 1px)",
    );
  });

  it("renders 'grid' variant correctly", () => {
    const { container } = render(<BGPattern variant="grid" />);
    const div = container.firstChild;
    expect(div).toHaveStyle(
      "background-image: linear-gradient(to right, #252525 1px, transparent 1px), linear-gradient(to bottom, #252525 1px, transparent 1px)",
    );
  });

  it("renders 'diagonal-stripes' variant correctly", () => {
    const { container } = render(<BGPattern variant="diagonal-stripes" />);
    expect(container.firstChild).toHaveStyle(
      "background-image: repeating-linear-gradient(45deg, #252525, #252525 1px, transparent 1px, transparent 24px)",
    );
  });

  it("renders 'horizontal-lines' variant correctly", () => {
    const { container } = render(<BGPattern variant="horizontal-lines" />);
    expect(container.firstChild).toHaveStyle(
      "background-image: linear-gradient(to bottom, #252525 1px, transparent 1px)",
    );
  });

  it("renders 'vertical-lines' variant correctly", () => {
    const { container } = render(<BGPattern variant="vertical-lines" />);
    expect(container.firstChild).toHaveStyle(
      "background-image: linear-gradient(to right, #252525 1px, transparent 1px)",
    );
  });

  it("renders 'checkerboard' variant correctly", () => {
    const { container } = render(<BGPattern variant="checkerboard" />);
    expect(container.firstChild).toHaveStyle(
      "background-image: linear-gradient(45deg, #252525 25%, transparent 25%), linear-gradient(-45deg, #252525 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #252525 75%), linear-gradient(-45deg, transparent 75%, #252525 75%)",
    );
  });

  it("renders 'unknown' variant correctly", () => {
    const { container } = render(<BGPattern variant="unknown" />);
    // undefined background image means no background-image is set
    expect(container.firstChild.style.backgroundImage).toBe("");
  });

  it("applies mask correctly", () => {
    const { container } = render(<BGPattern mask="fade-edges" />);
    const div = container.firstChild;
    expect(div).toHaveClass(
      "[mask-image:radial-gradient(ellipse_at_center,black,transparent)]",
    );
  });

  it("merges custom className", () => {
    const { container } = render(<BGPattern className="custom-bg" />);
    const div = container.firstChild;
    expect(div).toHaveClass("custom-bg");
  });
});
