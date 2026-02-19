"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
  onFocus,
  onBlur
}: {
  placeholders: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [isPlaceholderVisible, setIsPlaceholderVisible] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [animating, setAnimating] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAnimation = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setIsPlaceholderVisible(false);
      setTimeout(() => {
        setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
        setIsPlaceholderVisible(true);
      }, 300); // Matches CSS transition duration
    }, 3000);
  }, [placeholders.length]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible" && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      } else if (document.visibilityState === "visible" && !value) {
        startAnimation();
      }
    };

    if (!value) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      startAnimation();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [placeholders, value, startAnimation]);

  const draw = useCallback(() => {
    if (!inputRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    const computedStyles = getComputedStyle(inputRef.current);

    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = "#FFF";
    ctx.fillText(value, 16, 40);
  }, [value]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    vanishAndSubmit();
    if (onSubmit) {
      onSubmit(e);
    }
  };

  const vanishAndSubmit = () => {
    setAnimating(true);
    draw();
  };

  useEffect(() => {
    if (!animating) return;
    const timeout = setTimeout(() => {
      setValue("");
      setAnimating(false);
    }, 800);
    return () => clearTimeout(timeout);
  }, [animating]);

  return (
    <form
      className={cn(
        "w-full relative max-w-xl mx-auto bg-white h-12 rounded-full overflow-hidden shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] transition duration-200 border border-zinc-200",
        value && "bg-gray-50 bg-opacity-90"
      )}
      onSubmit={handleSubmit}
    >
      <canvas
        className={cn(
          "absolute pointer-events-none text-base transform scale-50 top-[20%] left-2 sm:left-8 origin-top-left filter invert dark:invert-0 pr-20 transition-opacity duration-300",
          !animating ? "opacity-0" : "opacity-100"
        )}
        ref={canvasRef}
      />

      <label htmlFor="hero-search" className="sr-only">Search for tools</label>
      <input
        ref={inputRef}
        id="hero-search"
        onChange={(e) => {
          if (!animating) {
            setValue(e.target.value);
            if (onChange) {
              onChange(e);
            }
          }
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        value={value}
        type="text"
        aria-label="Search tools"
        className={cn(
          "w-full relative z-50 border-none bg-transparent text-black h-full rounded-full focus:outline-none focus:ring-0 pl-4 sm:pl-10 pr-20 text-sm sm:text-base",
          animating && "text-transparent"
        )}
      />

      {/* Placeholder Text */}
      <div className="absolute inset-0 flex items-center rounded-full pointer-events-none">
        {!value && (
          <p
            className={cn(
              "dark:text-zinc-600 text-zinc-600 text-sm sm:text-base pl-4 sm:pl-10 text-left w-[calc(100%-2rem)] truncate transition-all duration-300 ease-in-out transform",
              isPlaceholderVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            {placeholders[currentPlaceholder]}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        disabled={!value}
        type="submit"
        aria-label="Submit search"
        className="absolute right-2 top-1/2 z-50 -translate-y-1/2 h-8 w-8 rounded-full bg-gray-100 transition duration-200 flex items-center justify-center hover:bg-gray-200"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-600 h-4 w-4"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path
            d="M5 12l14 0"
            className="transition-all duration-300 ease-linear"
            style={{
              strokeDasharray: "20px",
              strokeDashoffset: value ? "0px" : "10px"
            }}
          />
          <path d="M13 18l6 -6" />
          <path d="M13 6l6 6" />
        </svg>
      </button>

      {/* Exiting Value Animation (Fading Out) */}
      <div className="absolute inset-0 flex items-center rounded-full pointer-events-none">
        {animating && (
          <div
            className="w-full h-full bg-transparent flex items-center pl-4 sm:pl-10 pr-20 text-black text-sm sm:text-base transition-opacity duration-800 opacity-0"
          >
            {value}
          </div>
        )}
      </div>
    </form>
  );
}
