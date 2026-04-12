import { describe, it, expect, beforeEach } from "vitest";

// src/pages/Login.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Login from "./Login";
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

describe("Login Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (ui, { route = "/" } = {}) => {
    window.history.pushState({}, "Test page", route);
    return render(ui, { wrapper: BrowserRouter });
  };

  it("renders login form and offline status correctly", () => {
    vi.spyOn(WebSocketModule, "useWebSocket").mockReturnValue({
      isConnected: false,
      isAuthenticated: false,
      isMaintenance: false,
      sendCmd: vi.fn(),
    });

    renderWithRouter(<Login />);

    expect(screen.getByText(/CTF Login/i)).toBeInTheDocument();
    expect(screen.getByText(/OFFLINE/i)).toBeInTheDocument();

    // Login button should be disabled when offline
    const loginBtn = screen.getByRole("button", {
      name: /SYSTEM UNAVAILABLE/i,
    });
    expect(loginBtn).toHaveClass("cursor-not-allowed");
  });

  it("renders maintenance status correctly", () => {
    vi.spyOn(WebSocketModule, "useWebSocket").mockReturnValue({
      isConnected: true,
      isAuthenticated: false,
      isMaintenance: true,
      sendCmd: vi.fn(),
    });

    renderWithRouter(<Login />);

    expect(screen.getByText(/MAINTENANCE/i)).toBeInTheDocument();

    // Login button should be disabled when maintenance
    const loginBtn = screen.getByRole("button", {
      name: /SYSTEM UNAVAILABLE/i,
    });
    expect(loginBtn).toHaveClass("cursor-not-allowed");
  });

  it("allows login when connected", () => {
    const mockSendCmd = vi.fn();
    vi.spyOn(WebSocketModule, "useWebSocket").mockReturnValue({
      isConnected: true,
      isAuthenticated: false,
      isMaintenance: false,
      sendCmd: mockSendCmd,
    });

    renderWithRouter(<Login />);

    expect(screen.getByText(/ONLINE/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/Username/i), {
      target: { value: "admin" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), {
      target: { value: "password123" },
    });

    const loginBtn = screen.getByRole("button", { name: /ACCESS TERMINAL/i });
    expect(loginBtn).not.toHaveClass("cursor-not-allowed");

    fireEvent.click(loginBtn);
    expect(mockSendCmd).toHaveBeenCalledWith(
      Command.LOGIN,
      "admin:password123",
    );
  });

  it("prevents login with empty fields", () => {
    const mockSendCmd = vi.fn();
    vi.spyOn(WebSocketModule, "useWebSocket").mockReturnValue({
      isConnected: true,
      isAuthenticated: false,
      isMaintenance: false,
      sendCmd: mockSendCmd,
    });

    renderWithRouter(<Login />);

    const loginBtn = screen.getByRole("button", { name: /ACCESS TERMINAL/i });
    fireEvent.click(loginBtn);

    expect(mockSendCmd).not.toHaveBeenCalled();
  });

  it("redirects to /home upon successful authentication if no location.state.from", () => {
    vi.spyOn(WebSocketModule, "useWebSocket").mockReturnValue({
      isConnected: true,
      isAuthenticated: true,
      isMaintenance: false,
      sendCmd: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Login />
      </MemoryRouter>,
    );

    expect(mockNavigate).toHaveBeenCalledWith("/home", { replace: true });
  });

  it("redirects to location.state.from upon successful authentication", () => {
    vi.spyOn(WebSocketModule, "useWebSocket").mockReturnValue({
      isConnected: true,
      isAuthenticated: true,
      isMaintenance: false,
      sendCmd: vi.fn(),
    });

    render(
      <MemoryRouter
        initialEntries={[{ pathname: "/login", state: { from: "/secret" } }]}
      >
        <Login />
      </MemoryRouter>,
    );

    expect(mockNavigate).toHaveBeenCalledWith("/secret", { replace: true });
  });
});
