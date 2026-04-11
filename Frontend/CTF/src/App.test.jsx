import { describe, it, expect, beforeEach } from "vitest";

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from './App';
import * as WebSocketModule from './api/WebSocket';

// Mock components to simplify App testing
vi.mock('./pages/Login', () => ({
  default: () => <div data-testid="login-page">Login Page</div>
}));
vi.mock('./pages/Home', () => ({
  default: () => <div data-testid="home-page">Home Page</div>
}));
vi.mock('./components/Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));
vi.mock('./components/magicui/pointer', () => ({
  Pointer: () => <div data-testid="pointer">Pointer</div>
}));

// We only need to mock useWebSocket behavior inside ProtectedLayout
// WebSocketProvider is also rendered, but we need useWebSocket to return our desired state.
describe('App Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderApp = (initialRoute) => {
    window.history.pushState({}, 'Test page', initialRoute);
    return render(<App />);
  };

  it('renders Login on /login irrespective of auth state', () => {
    vi.spyOn(WebSocketModule, 'useWebSocket').mockReturnValue({
      isAuthenticated: false,
      isMaintenance: false,
    });
    
    renderApp('/login');
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('redirects to /login when navigating to a protected route unauthenticated', () => {
    vi.spyOn(WebSocketModule, 'useWebSocket').mockReturnValue({
      isAuthenticated: false,
      isMaintenance: false,
    });
    
    renderApp('/home');
    // It should hit ProtectedLayout, which redirects to /login
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('redirects to /login when navigating to a protected route during maintenance', () => {
    vi.spyOn(WebSocketModule, 'useWebSocket').mockReturnValue({
      isAuthenticated: true,
      isMaintenance: true,
    });
    
    renderApp('/home');
    // It should hit ProtectedLayout, which redirects to /login due to maintenance
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('renders protected route and Header when authenticated and not in maintenance', () => {
    vi.spyOn(WebSocketModule, 'useWebSocket').mockReturnValue({
      isAuthenticated: true,
      isMaintenance: false,
    });
    
    renderApp('/home');
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('redirects unknown paths to /home, which may redirect to /login if unauthenticated', () => {
    vi.spyOn(WebSocketModule, 'useWebSocket').mockReturnValue({
      isAuthenticated: false,
      isMaintenance: false,
    });
    
    renderApp('/some-unknown-path');
    // * redirects to /home, /home throws to /login
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });
});
