// src/pages/Login.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Login from './Login';
import * as WebSocketModule from '../api/WebSocket';

// Mock react-router's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form and offline status correctly', () => {
    // Mock the websocket context
    vi.spyOn(WebSocketModule, 'useWebSocket').mockReturnValue({
      isConnected: false,
      isAuthenticated: false,
      isMaintenance: false,
      sendCmd: vi.fn(),
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText(/CTF Login/i)).toBeInTheDocument();
    expect(screen.getByText(/Server Status: OFFLINE/i)).toBeInTheDocument();
    
    // Login button should be disabled when offline
    const loginBtn = screen.getByRole('button', { name: /login/i });
    expect(loginBtn).toBeDisabled();
  });

  it('allows login when connected', () => {
    const mockSendCmd = vi.fn();
    vi.spyOn(WebSocketModule, 'useWebSocket').mockReturnValue({
      isConnected: true,
      isAuthenticated: false,
      isMaintenance: false,
      sendCmd: mockSendCmd,
    });

    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText(/Server Status: ONLINE/i)).toBeInTheDocument();
    
    // Type in inputs (these match the placeholders in your Login component)
    fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    
    const loginBtn = screen.getByRole('button', { name: /login/i });
    expect(loginBtn).not.toBeDisabled();
    
    fireEvent.click(loginBtn);
    // Asserts that your function successfully triggered the socket send event!
    expect(mockSendCmd).toHaveBeenCalledWith(expect.anything(), 'admin:password123');
  });
});