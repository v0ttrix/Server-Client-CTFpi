import React, { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
} from "motion/react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Pointer({ children, className, ...props }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { damping: 50, stiffness: 700 });
  const springY = useSpring(y, { damping: 50, stiffness: 700 });
  const transform = useMotionTemplate`translateX(${springX}px) translateY(${springY}px)`;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible, x, y]);

  return (
    <motion.div
      className={cn("pointer-events-none fixed left-0 top-0 z-50", className)}
      style={{
        transform,
        opacity: isVisible ? 1 : 0,
      }}
      {...props}
    >
      {children || (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 01.35-.15h6.42a.5.5 0 00.35-.85L5.5 3.21z"
            fill="currentColor"
            stroke="white"
            strokeWidth="1.5"
          />
        </svg>
      )}
    </motion.div>
  );
}
