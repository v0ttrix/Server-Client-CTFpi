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

  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px)`;

  const [isVisible, setIsVisible] = useState(false);
  const [cursorState, setCursorState] = useState("default");

  useEffect(() => {
    const handleMouseMove = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target;
      try {
        const isText =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable;

        const isClickable =
          target.tagName === "A" ||
          target.tagName === "BUTTON" ||
          target.tagName === "SELECT" ||
          target.closest?.("a") ||
          target.closest?.("button") ||
          target.getAttribute?.("role") === "button" ||
          target.getAttribute?.("role") === "link";

        if (isText) {
          setCursorState("text");
        } else if (isClickable) {
          setCursorState("pointer");
        } else {
          setCursorState("default");
        }
      } catch (err) {
        setCursorState("default");
      }
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
          className="transition-transform duration-200"
          style={{
            transform:
              cursorState === "pointer"
                ? "translate(-8px, -2px) scale(0.9)"
                : cursorState === "text"
                  ? "translate(-12px, -12px) scale(0.8)"
                  : "scale(1)",
          }}
        >
          {cursorState === "text" ? (
            <path
              d="M12 4v16M8 4h8M8 20h8"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : cursorState === "pointer" ? (
            <path
              d="M 9.5 1 C 8.672 1 8 1.672 8 2.5 L 8 9 L 8 14 L 8 15.060547 L 5.3378906 13.710938 C 4.7798906 13.427938 4.1072344 13.492906 3.6152344 13.878906 C 2.8562344 14.474906 2.7887031 15.601203 3.4707031 16.283203 L 8.3085938 21.121094 C 8.8715937 21.684094 9.6346875 22 10.429688 22 L 17 22 C 18.657 22 20 20.657 20 19 L 20 12.193359 C 20 11.216359 19.292125 10.381703 18.328125 10.220703 L 11 9 L 11 2.5 C 11 1.672 10.328 1 9.5 1 z"
              fill="currentColor"
              stroke="white"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          ) : (
            <path
              d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87a.5.5 0 0 0 .35-.85L6.35 2.85a.5.5 0 0 0-.85.35Z"
              fill="currentColor"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          )}
        </svg>
      )}
    </motion.div>
  );
}
