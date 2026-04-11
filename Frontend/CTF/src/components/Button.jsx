import React from "react";
import { Link } from "react-router-dom";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function Button({ className, to, children, ...props }) {
  const baseClasses =
    "inline-block text-center py-[1.3em] px-[3em] text-[12px] uppercase tracking-[2.5px] font-bold text-black bg-white border-none rounded-[45px] shadow-[0px_8px_15px_rgba(0,0,0,0.1)] transition-all duration-300 ease-out cursor-pointer outline-none hover:bg-green-500 hover:shadow-[0px_15px_20px_rgba(46,229,157,0.4)] hover:-translate-y-1.75 active:-translate-y-px";

  if (to) {
    return (
      <Link
        to={to}
        className={twMerge(clsx(baseClasses, className))}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button className={twMerge(clsx(baseClasses, className))} {...props}>
      {children}
    </button>
  );
}
