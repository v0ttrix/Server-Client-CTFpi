import { describe, it, expect, beforeEach, vi } from "vitest";
// src/components/Header.test.jsx
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Header from "./Header";

describe("Header Component", () => {
  it("renders the branding title string", () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    );
    expect(screen.getByAltText(/CTF Pi Logo/i)).toBeInTheDocument();
  });

  it("contains navigation links", () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>,
    );

    expect(screen.getByRole("link", { name: /Home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /About/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Challenges/i }),
    ).toBeInTheDocument();
  });
});
