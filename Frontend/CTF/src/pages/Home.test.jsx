import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Home from "./Home";

describe("Home Page", () => {
  it("renders correctly", () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    );
    expect(screen.getByText(/Capture The Flag/i)).toBeInTheDocument();
    expect(screen.getByText(/Welcome to the terminal/i)).toBeInTheDocument();
    const linkBtn = screen.getByRole("link", { name: /View Challenges/i });
    expect(linkBtn).toBeInTheDocument();
    expect(linkBtn).toHaveAttribute("href", "/challenges");
  });

  it("sets document title", () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>,
    );
    expect(document.title).toBe("CTF Pi | Home");
  });
});
