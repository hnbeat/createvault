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

const particleColors = [
  "#4a5a6a", "#6a8a7a", "#8aa5c5", "#c5a5a5", "#8a8a8a",
  "#5BB09A", "#7AAED4", "#9A85C9",
];

function generateParticles(count: number) {
  const particles: { x: number; y: number; size: number; opacity: number; delay: number; duration: number; color: string }[] = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 16807 + 0) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  for (let i = 0; i < count; i++) {
    const color = particleColors[Math.floor(rand() * particleColors.length)];
    particles.push({
      x: rand() * 100,
      y: rand() * 100,
      size: 1 + rand() * 2.5,
      opacity: 0.1 + rand() * 0.35,
      delay: rand() * 6,
      duration: 4 + rand() * 5,
      color,
    });
  }
  return particles;
}

export function HeroBanner({ categories }: HeroBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boxRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const particles = useMemo(() => generateParticles(60), []);
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
      smoothMouse.current.x += (mousePos.current.x - smoothMouse.current.x) * 0.05;
      smoothMouse.current.y += (mousePos.current.y - smoothMouse.current.y) * 0.05;

      const t = time * 0.001;

      for (let i = 0; i < count; i++) {
        const el = boxRefs.current[i];
        if (!el) continue;

        const speed = 0.15 + i * 0.02;
        const baseAngle = (i / count) * Math.PI * 2;
        const angle = baseAngle + t * speed;

        const x = Math.sin(angle) * radiusX;
        const z = Math.cos(angle) * radiusZ;
        const yFloat = Math.sin(t * (0.5 + i * 0.1)) * 20 + (i % 3 - 1) * 25;

        const depthScale = 0.7 + 0.3 * ((z + radiusZ) / (radiusZ * 2));
        const depthOpacity = 0.4 + 0.6 * ((z + radiusZ) / (radiusZ * 2));

        el.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${yFloat}px, 0px) scale(${depthScale})`;
        el.style.opacity = `${depthOpacity}`;
        el.style.zIndex = `${Math.round(z + radiusZ)}`;
      }

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
      {/* Subtle ambient gradient */}
      <div
        className="absolute inset-0 z-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse at 30% 20%, rgba(122, 174, 212, 0.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(154, 133, 201, 0.06) 0%, transparent 60%)",
        }}
      />

      {/* Particle field */}
      <div className="absolute inset-0 z-0">
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.opacity,
              animation: `pulse-fade ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Top text */}
      <div className="relative z-10 text-left self-start mb-6 pointer-events-none px-8 sm:px-12 lg:px-16">
        <h1 className="text-5xl sm:text-6xl font-semibold text-white tracking-tight" style={{ letterSpacing: "-0.02em" }}>
          Get Inspired
        </h1>
        <p className="mt-4 text-lg text-white/40">
          Your team&apos;s starting point for references
        </p>
        <p className="mt-6 text-sm uppercase tracking-widest text-white/30" style={{ letterSpacing: "0.08em" }}>
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
            className="group absolute top-1/2 left-1/2 flex items-center justify-center rounded-xl border border-bd bg-neutral-950/80 backdrop-blur-sm hover:bg-white hover:border-white transition-all duration-200"
            style={{
              width: "440px",
              height: "180px",
              transform: "translate(-50%, -50%)",
              opacity: mounted ? 1 : 0,
              transition: mounted ? "background-color 0.2s, border-color 0.2s" : `opacity 0.5s ${i * 80}ms`,
            }}
          >
            <span className="text-lg font-semibold uppercase tracking-widest text-white group-hover:text-black transition-colors">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>

      <style>{`
        @keyframes pulse-fade {
          0%, 100% { opacity: 0.08; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}
