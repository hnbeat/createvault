"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  color: string | null;
}

interface HeroBannerProps {
  categories: Category[];
}

// Generate stable random stars
const starColors = [
  "#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff",
  "#fef3c7", "#fde68a", "#fcd34d",       // warm yellows
  "#e9d5ff", "#d8b4fe", "#c084fc",       // soft purples
  "#bfdbfe", "#93c5fd",                   // faint blues
  "#fecdd3", "#fda4af",                   // subtle pinks
];

function generateStars(count: number) {
  const stars: { x: number; y: number; size: number; opacity: number; delay: number; duration: number; color: string }[] = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    const color = starColors[Math.floor(rand() * starColors.length)];
    stars.push({
      x: rand() * 100,
      y: rand() * 100,
      size: 1 + rand() * 2,
      opacity: color === "#ffffff" ? 0.15 + rand() * 0.5 : 0.25 + rand() * 0.55,
      delay: rand() * 5,
      duration: 3 + rand() * 4,
      color,
    });
  }
  return stars;
}

export function HeroBanner({ categories }: HeroBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const stars = useMemo(() => generateStars(80), []);
  const animRef = useRef<number>(0);

  const count = categories.length;
  const radiusX = 500;
  const radiusZ = 280;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mousePos.current = {
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      };
    };

    const el = containerRef.current;
    if (el) {
      el.addEventListener("mousemove", handleMouseMove);
      return () => el.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  const animate = useCallback(
    (time: number) => {
      // Smooth mouse following
      smoothMouse.current.x += (mousePos.current.x - smoothMouse.current.x) * 0.05;
      smoothMouse.current.y += (mousePos.current.y - smoothMouse.current.y) * 0.05;

      const t = time * 0.001; // seconds

      for (let i = 0; i < count; i++) {
        const el = boxRefs.current[i];
        if (!el) continue;

        const speed = 0.15 + i * 0.02;
        const baseAngle = (i / count) * Math.PI * 2;
        const angle = baseAngle + t * speed;

        const x = Math.sin(angle) * radiusX;
        const z = Math.cos(angle) * radiusZ;
        const yFloat = Math.sin(t * (0.5 + i * 0.1)) * 20 + (i % 3 - 1) * 25;

        // Depth-based scale for 3D feel (closer = bigger, further = smaller)
        const depthScale = 0.7 + 0.3 * ((z + radiusZ) / (radiusZ * 2));
        const depthOpacity = 0.4 + 0.6 * ((z + radiusZ) / (radiusZ * 2));

        el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${yFloat}px, 0px) scale(${depthScale})`;
        el.style.opacity = `${depthOpacity}`;
        el.style.zIndex = `${Math.round(z + radiusZ)}`;
      }

      // Tilt the whole orbit container based on mouse
      const orbitEl = containerRef.current?.querySelector<HTMLDivElement>("[data-orbit]");
      if (orbitEl) {
        orbitEl.style.transform = `rotateX(${-smoothMouse.current.y * 8}deg) rotateY(${smoothMouse.current.x * 10}deg)`;
      }

      animRef.current = requestAnimationFrame(animate);
    },
    [count, radiusX, radiusZ]
  );

  useEffect(() => {
    if (!mounted) return;
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [mounted, animate]);

  return (
    <section
      ref={containerRef}
      className="relative flex flex-col items-center justify-center border-b border-bd bg-neutral-950 overflow-hidden -mx-4 sm:-mx-6 lg:-mx-8"
      style={{ minHeight: "700px" }}
    >
      {/* Star field */}
      <div className="absolute inset-0 z-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.color,
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Pixel spaceship — behind everything */}
      <div className="absolute z-[1] pointer-events-none" style={{ animation: "spaceship 30s linear infinite" }}>
        <svg width="40" height="48" viewBox="0 0 20 24" fill="none" shapeRendering="crispEdges" className="opacity-50" style={{ imageRendering: "pixelated" }}>
          {/* Main body */}
          <rect x="9" y="1" width="2" height="1" fill="#ccc"/>
          <rect x="8" y="2" width="4" height="1" fill="#b0b0b0"/>
          <rect x="8" y="3" width="4" height="1" fill="#999"/>
          <rect x="7" y="4" width="6" height="1" fill="#aaa"/>
          <rect x="7" y="5" width="6" height="1" fill="#999"/>
          {/* Cockpit */}
          <rect x="9" y="5" width="2" height="2" fill="#3a6fa8"/>
          <rect x="9" y="7" width="2" height="1" fill="#2b5580"/>
          {/* Mid body */}
          <rect x="7" y="6" width="6" height="1" fill="#888"/>
          <rect x="6" y="7" width="8" height="1" fill="#999"/>
          <rect x="6" y="8" width="8" height="1" fill="#8a8a8a"/>
          <rect x="6" y="9" width="8" height="1" fill="#999"/>
          <rect x="7" y="10" width="6" height="1" fill="#aaa"/>
          <rect x="7" y="11" width="6" height="1" fill="#999"/>
          {/* Center stripe */}
          <rect x="9" y="8" width="2" height="4" fill="#ccc"/>
          {/* Side cannons left */}
          <rect x="3" y="8" width="3" height="1" fill="#777"/>
          <rect x="2" y="9" width="4" height="1" fill="#888"/>
          <rect x="2" y="10" width="4" height="3" fill="#777"/>
          <rect x="3" y="13" width="2" height="1" fill="#666"/>
          {/* Cannon detail left */}
          <rect x="2" y="11" width="1" height="1" fill="#3a6fa8"/>
          <rect x="4" y="11" width="1" height="1" fill="#3a6fa8"/>
          {/* Side cannons right */}
          <rect x="14" y="8" width="3" height="1" fill="#777"/>
          <rect x="14" y="9" width="4" height="1" fill="#888"/>
          <rect x="14" y="10" width="4" height="3" fill="#777"/>
          <rect x="15" y="13" width="2" height="1" fill="#666"/>
          {/* Cannon detail right */}
          <rect x="15" y="11" width="1" height="1" fill="#3a6fa8"/>
          <rect x="17" y="11" width="1" height="1" fill="#3a6fa8"/>
          {/* Lower body */}
          <rect x="7" y="12" width="6" height="1" fill="#888"/>
          <rect x="7" y="13" width="6" height="1" fill="#777"/>
          <rect x="8" y="14" width="4" height="1" fill="#888"/>
          <rect x="8" y="15" width="4" height="1" fill="#777"/>
          <rect x="9" y="16" width="2" height="1" fill="#888"/>
          {/* Thruster */}
          <rect x="9" y="17" width="2" height="1" fill="#e8a030"/>
          <rect x="9" y="18" width="2" height="1" fill="#e86830" opacity="0.8"/>
          <rect x="9" y="19" width="2" height="1" fill="#e83030" opacity="0.5"/>
          {/* Thruster glow */}
          <rect x="9" y="20" width="2" height="2" fill="#ff6020" opacity="0.2"/>
        </svg>
      </div>

      {/* Top text — always on top, left aligned */}
      <div className="relative z-10 text-left self-start mb-6 pointer-events-none px-8 sm:px-12 lg:px-16">
        <h1 className="text-5xl sm:text-6xl font-bold text-white tracking-tight">
          Get Inspired
        </h1>
        <p className="mt-4 text-lg text-white/40">
          Your team&apos;s starting point for references
        </p>
        <p className="mt-6 text-sm uppercase tracking-widest text-white/30">
          What are you looking for?
        </p>
      </div>

      {/* 3D orbiting container */}
      <div
        data-orbit
        className="relative z-0"
        style={{
          width: "100%",
          height: "380px",
          transformStyle: "preserve-3d",
          transition: "transform 0.1s linear",
        }}
      >
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            ref={(el) => { boxRefs.current[i] = el; }}
            href={`/categories/${cat.slug}`}
            className="group absolute top-1/2 left-1/2 flex items-center justify-center border border-bd bg-neutral-950/80 backdrop-blur-sm hover:bg-white hover:border-white"
            style={{
                width: "440px",
                height: "180px",
              transform: "translate(-50%, -50%)",
              opacity: mounted ? 1 : 0,
              transition: mounted ? "background-color 0.3s, border-color 0.3s" : `opacity 0.5s ${i * 80}ms`,
            }}
          >
            <span className="text-lg font-semibold uppercase tracking-widest text-white group-hover:text-black transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.7; }
        }
        @keyframes spaceship {
          0% {
            top: 65%;
            left: -50px;
            transform: rotate(-262deg);
          }
          15% {
            top: 40%;
            left: 15%;
            transform: rotate(-275deg);
          }
          30% {
            top: 55%;
            left: 35%;
            transform: rotate(-265deg);
          }
          50% {
            top: 25%;
            left: 55%;
            transform: rotate(-278deg);
          }
          70% {
            top: 50%;
            left: 75%;
            transform: rotate(-268deg);
          }
          85% {
            top: 30%;
            left: 90%;
            transform: rotate(-272deg);
          }
          100% {
            top: 35%;
            left: calc(100% + 50px);
            transform: rotate(-275deg);
          }
        }
      `}</style>
    </section>
  );
}
