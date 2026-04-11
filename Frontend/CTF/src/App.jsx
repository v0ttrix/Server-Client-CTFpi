import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { WebSocketProvider, useWebSocket } from "./api/WebSocket";
import Header from "./components/Header";
import Login from "./pages/Login";
import Home from "./pages/Home";
import About from "./pages/About";
import Challenges from "./pages/Challenges";
import ChallengeDetail from "./pages/ChallengeDetail";
import { Pointer } from "./components/magicui/pointer";
import { BGPattern } from "./components/magicui/bg-pattern";

function ProtectedLayout() {
  const { isAuthenticated, isMaintenance } = useWebSocket();
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (isMaintenance) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
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
        <Pointer className="text-green-500 fill-green-500" />
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected Routes */}
          <Route element={<ProtectedLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/challenges" element={<Challenges />} />
            <Route path="/challenges/:id" element={<ChallengeDetail />} />
          </Route>

          {/* Redirect to login if user types an unknown path or accesses root */}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </WebSocketProvider>
  );
}
