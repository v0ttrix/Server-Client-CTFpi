import "./App.css";
import Home from "./pages/Home";
import About from "./pages/About";
import Challenges from "./pages/Challenges";
import Login from "./pages/Login";
import Header from "./components/Header";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="*"
            element={
              <>
                <Header />
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/challenges" element={<Challenges />} />
                </Routes>
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
