import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "motion/react";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // You can wire up your actual logout context clearing here in the future
    navigate("/login");
  };

  const NavItem = ({ to, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative px-2 py-2 text-sm uppercase tracking-widest transition-all duration-300 active:scale-95 ${
          isActive
            ? "text-green-500 font-bold"
            : "text-gray-400 hover:text-green-300 hover:-translate-y-px font-medium"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {label}
          {isActive && (
            <motion.div
              layoutId="activeNavTab"
              className="absolute -bottom-1.5 left-0 right-0 h-0.5 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,1)]"
              initial={false}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <header className="flex items-center justify-between py-4 px-6 sm:px-10 bg-[#070707]/90 backdrop-blur-md min-h-17.5 border-b border-green-500/20 sticky top-0 z-50">
      {/* Left: Site Icon (Image) */}
      <div className="flex-1 flex justify-start">
        <NavLink
          to="/home"
          className="transition-all duration-200 active:scale-90 hover:opacity-80 hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]"
          title="Home"
        >
          {/* Replace this src with your actual logo image path later! */}
          <img
            src="/vite.svg"
            alt="CTF Pi Logo"
            className="h-8 w-auto object-contain"
          />
        </NavLink>
      </div>

      {/* Center: Navigation Links */}
      <nav className="flex-1 flex justify-center items-center gap-6 sm:gap-12">
        <NavItem to="/home" label="Home" />
        <NavItem to="/challenges" label="Challenges" />
        <NavItem to="/about" label="About" />
      </nav>

      {/* Right: Logout Button */}
      <div className="flex-1 flex justify-end">
        <button
          onClick={handleLogout}
          className="py-[0.8em] px-[2em] text-[11px] uppercase tracking-[2px] font-bold text-green-500 bg-transparent border-[1.5px] border-green-500 rounded-[45px] transition-all duration-300 ease-out cursor-pointer outline-none hover:bg-green-500 hover:text-black hover:shadow-[0px_0px_15px_rgba(34,197,94,0.4)] hover:-translate-y-0.5 active:translate-y-px active:scale-95"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
