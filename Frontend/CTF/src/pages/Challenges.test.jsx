import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import Challenges, { challengesData } from "./Challenges";
import * as WebSocketModule from "../api/WebSocket";
import { Command } from "../api/client";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("Challenges Page", () => {
  let mockSendCmd;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSendCmd = vi.fn();
    vi.spyOn(WebSocketModule, "useWebSocket").mockReturnValue({
      sendCmd: mockSendCmd,
      lastMessage: null,
    });
    localStorage.clear();
  });

  const renderWithRouter = (ui) => {
    return render(ui, { wrapper: BrowserRouter });
  };

  it("renders correctly", () => {
    renderWithRouter(<Challenges />);
    expect(screen.getByText("Active Challenges")).toBeInTheDocument();

    // Check if some challenges are rendered
    expect(screen.getByText(challengesData[0].title)).toBeInTheDocument();
    expect(screen.getByText(challengesData[1].title)).toBeInTheDocument();
  });

  it("navigates to challenge detail on click", () => {
    renderWithRouter(<Challenges />);
    const firstChallenge = screen
      .getByText(challengesData[0].title)
      .closest("[role='button']");
    fireEvent.click(firstChallenge);
    expect(mockNavigate).toHaveBeenCalledWith(
      `/challenges/${challengesData[0].id}`,
    );
  });

  it("navigates to challenge detail on Enter key press", () => {
    renderWithRouter(<Challenges />);
    const firstChallenge = screen
      .getByText(challengesData[0].title)
      .closest("[role='button']");
    fireEvent.keyDown(firstChallenge, { key: "Enter" });
    expect(mockNavigate).toHaveBeenCalledWith(
      `/challenges/${challengesData[0].id}`,
    );
  });

  it("navigates to challenge detail on Space key press", () => {
    renderWithRouter(<Challenges />);
    const firstChallenge = screen
      .getByText(challengesData[0].title)
      .closest("[role='button']");
    fireEvent.keyDown(firstChallenge, { key: " " });
    expect(mockNavigate).toHaveBeenCalledWith(
      `/challenges/${challengesData[0].id}`,
    );
  });

  it("handles lastMessage correctly (string message)", () => {
    vi.spyOn(WebSocketModule, "useWebSocket").mockReturnValue({
      sendCmd: mockSendCmd,
      lastMessage: { payload: "Flag submitted", isImage: false },
    });

    renderWithRouter(<Challenges />);
    expect(screen.getByText(/Server:/)).toBeInTheDocument();
    expect(screen.getByText(/Flag submitted/)).toBeInTheDocument();
  });

  it("handles lastMessage correctly (error message without payload)", () => {
    vi.spyOn(WebSocketModule, "useWebSocket").mockReturnValue({
      sendCmd: mockSendCmd,
      lastMessage: {
        payload: null,
        error: "Something went wrong",
        isImage: false,
      },
    });

    renderWithRouter(<Challenges />);
    expect(screen.getByText(/Server:/)).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument();
  });

  it("handles lastMessage correctly (image message)", () => {
    vi.spyOn(WebSocketModule, "useWebSocket").mockReturnValue({
      sendCmd: mockSendCmd,
      lastMessage: { payload: "base64image", isImage: true },
    });

    renderWithRouter(<Challenges />);
    expect(
      screen.getByText(/Flag image downloaded successfully!/),
    ).toBeInTheDocument();
    const img = screen.getByAltText("CTF Flag Payload");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "data:image/jpeg;base64,base64image");
  });

  it("triggers toggle maintenance command", () => {
    renderWithRouter(<Challenges />);
    const btn = screen.getByRole("button", { name: /Toggle Maintenance/i });
    fireEvent.click(btn);
    expect(mockSendCmd).toHaveBeenCalledWith(Command.TOGGLE_MAINTENANCE, "");
  });

  it("triggers download network flag command", () => {
    renderWithRouter(<Challenges />);
    const btn = screen.getByRole("button", { name: /Download Network Flag/i });
    fireEvent.click(btn);
    expect(mockSendCmd).toHaveBeenCalledWith(Command.REQUEST_FLAG_IMAGE, "");
  });

  it("renders completed challenges conditionally and correctly", () => {
    localStorage.setItem("completedChallenges", JSON.stringify([1]));
    renderWithRouter(<Challenges />);

    const firstChallenge = screen
      .getByText(challengesData[0].title)
      .closest("[role='button']");
    expect(firstChallenge).toHaveClass("opacity-50");
    expect(firstChallenge).toHaveClass("grayscale");
  });
});
