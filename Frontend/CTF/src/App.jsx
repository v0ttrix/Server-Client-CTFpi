import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WebSocketProvider, useWebSocket } from "./api/WebSocket";
import Header from "./components/Header";
import Login from "./pages/Login";
import Home from "./pages/Home";
import About from "./pages/About";
import Challenges from "./pages/Challenges";
import { Pointer } from "./components/magicui/pointer";
import { BGPattern } from "./components/magicui/bg-pattern";

function ProtectedRoute({ children }) {
  const { isAuthenticated, isMaintenance } = useWebSocket();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isMaintenance) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <WebSocketProvider>
      <div className="fixed inset-0 z-[-1] min-h-screen bg-[#070707] pointer-events-none">
        <BGPattern
          variant="dots"
          mask="fade-center"
          fill="#22c55e"
          size={40}
          className="opacity-80"
        />
      </div>
      <BrowserRouter>
        <Header />
        <Pointer className="text-green-500 fill-green-500" />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          {/* <Route
            path="*"
            element={
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
          /> */}
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  );
}
