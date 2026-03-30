import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WebSocketProvider, useWebSocket } from "./api/WebSocket";
import Header from "./components/Header";
import Login from "./pages/Login";
import Home from "./pages/Home";
import About from "./pages/About";
import Challenges from "./pages/Challenges";

function ProtectedRoute({ children }) {
    const { isAuthenticated } = useWebSocket();
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <WebSocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <Routes>
                    <Route path="/home" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/challenges" element={<Challenges />} />
                  </Routes>
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  );
}