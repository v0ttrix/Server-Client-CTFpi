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
    <header className="flex flex-wrap md:flex-nowrap items-center justify-between py-3 md:py-4 px-4 sm:px-6 md:px-10 bg-[#070707]/90 backdrop-blur-md border-b border-green-500/20 sticky top-0 z-50 gap-y-3 md:gap-y-0">
      {/* Left: Site Icon (Image) */}
      <div className="flex w-auto md:flex-1 justify-start order-1">
        <NavLink
          to="/home"
          className="flex items-center gap-2 transition-all duration-200 active:scale-90 hover:opacity-80 hover:drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]"
          title="Home"
        >
          <img
            src="/CTF-Icon.png"
            alt="CTF Pi Logo"
            className="h-7 md:h-8 w-auto object-contain"
          />
          <span className="text-lg md:text-xl font-bold text-green-500 uppercase tracking-widest hidden sm:block">
            CTF
          </span>
        </NavLink>
      </div>

      {/* Center: Navigation Links */}
      <nav className="flex w-full md:w-auto md:flex-1 justify-center items-center gap-4 sm:gap-8 md:gap-12 order-3 md:order-2 pb-1 md:pb-0">
        <NavItem to="/home" label="Home" />
        <NavItem to="/challenges" label="Challenges" />
        <NavItem to="/about" label="About" />
      </nav>

      {/* Right: Logout Button */}
      <div className="flex w-auto md:flex-1 justify-end order-2 md:order-3">
        <button
          onClick={handleLogout}
          className="py-[0.5em] px-[1.2em] md:py-[0.8em] md:px-[2em] text-[10px] md:text-[11px] uppercase tracking-[2px] font-bold text-green-500 bg-transparent border-[1.5px] border-green-500 rounded-lg md:rounded-xl transition-all duration-300 ease-out cursor-pointer outline-none hover:bg-green-500 hover:text-black hover:shadow-[0px_0px_15px_rgba(34,197,94,0.4)] hover:-translate-y-0.5 active:translate-y-px active:scale-95"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
