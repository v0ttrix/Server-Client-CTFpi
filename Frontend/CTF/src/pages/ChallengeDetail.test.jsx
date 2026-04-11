import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ChallengeDetail from "./ChallengeDetail";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("ChallengeDetail Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderWithRouter = (initialEntries = ["/challenges/1"]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/challenges/:id" element={<ChallengeDetail />} />
        </Routes>
      </MemoryRouter>,
    );
  };

  it("renders 404 for an invalid challenge ID", () => {
    renderWithRouter(["/challenges/9999"]);
    expect(screen.getByText("404 - Challenge Not Found")).toBeInTheDocument();
    expect(document.title).toBe("CTF Pi | 404");
  });

  it("renders challenge detail correctly", () => {
    renderWithRouter(["/challenges/1"]);
    expect(screen.getByText("Sanity Check")).toBeInTheDocument();
    expect(screen.getByText(/Objective Overview/i)).toBeInTheDocument();
    expect(document.title).toBe("CTF Pi | Sanity Check");

    const markCompleteBtn = screen.getByRole("button", {
      name: "Mark as Completed",
    });
    expect(markCompleteBtn).toBeInTheDocument();
  });

  it("marks challenge as complete", () => {
    renderWithRouter(["/challenges/1"]);
    const btn = screen.getByRole("button", { name: "Mark as Completed" });
    fireEvent.click(btn);

    expect(mockNavigate).toHaveBeenCalledWith("/challenges");
    const completed = JSON.parse(localStorage.getItem("completedChallenges"));
    expect(completed).toContain(1);
  });

  it("shows 'Completed ✓' if challenge is already completed", () => {
    localStorage.setItem("completedChallenges", JSON.stringify([1]));
    renderWithRouter(["/challenges/1"]);

    expect(
      screen.getByRole("button", { name: "Completed ✓" }),
    ).toBeInTheDocument();
  });

  it("cancels and navigates back to challenges", () => {
    renderWithRouter(["/challenges/1"]);
    const cancelBtn = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelBtn);
    expect(mockNavigate).toHaveBeenCalledWith("/challenges");
  });
});
