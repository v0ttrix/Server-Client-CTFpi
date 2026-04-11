import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import About from "./About";

describe("About Page", () => {
  it("renders About The Project section", () => {
    render(<About />);
    expect(screen.getByText("About The Project")).toBeInTheDocument();
    expect(
      screen.getByText(/CTF Pi is an interactive Capture The Flag platform/i),
    ).toBeInTheDocument();
  });

  it("renders Rules of Engagement section", () => {
    render(<About />);
    expect(screen.getByText("Rules of Engagement")).toBeInTheDocument();
    expect(
      screen.getByText(/No Denial of Service \(DoS\):/i),
    ).toBeInTheDocument();
  });

  it("renders Meet The Team section", () => {
    render(<About />);
    expect(screen.getByText("Meet The Team")).toBeInTheDocument();

    // There are 4 team members
    const roles = screen.getAllByText("Developer");
    expect(roles).toHaveLength(4);
  });

  it("sets document title", () => {
    render(<About />);
    expect(document.title).toBe("CTF Pi | About");
  });
});
