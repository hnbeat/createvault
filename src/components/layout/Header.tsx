"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SearchBar } from "../ui/SearchBar";
import { useEffect, useState } from "react";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

function NavIcon({ name }: { name: string }) {
  const props = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

  switch (name) {
    case "home":
      return (
        <svg {...props}>
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
        </svg>
      );
    case "categories":
      return (
        <svg {...props}>
          <path d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      );
    case "collections":
      return (
        <svg {...props}>
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    case "bookmarks":
      return (
        <svg {...props}>
          <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      );
    case "submit":
      return (
        <svg {...props}>
          <path d="M12 4v16m8-8H4" />
        </svg>
      );
    case "admin":
      return (
        <svg {...props}>
          <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    default:
      return null;
  }
}

/* Pixel-art astronaut icon (16x16 style) */
function AstronautIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      {/* Helmet */}
      <rect x="5" y="1" width="6" height="1" fill="white" />
      <rect x="4" y="2" width="1" height="1" fill="white" />
      <rect x="11" y="2" width="1" height="1" fill="white" />
      <rect x="3" y="3" width="1" height="3" fill="white" />
      <rect x="12" y="3" width="1" height="3" fill="white" />
      {/* Visor */}
      <rect x="4" y="3" width="8" height="3" fill="#4af" opacity="0.6" />
      {/* Visor shine */}
      <rect x="5" y="3" width="2" height="1" fill="white" opacity="0.4" />
      {/* Chin */}
      <rect x="4" y="6" width="8" height="1" fill="white" />
      {/* Body */}
      <rect x="4" y="7" width="8" height="1" fill="#e0e0e0" />
      <rect x="3" y="8" width="10" height="3" fill="white" />
      {/* Backpack */}
      <rect x="2" y="8" width="1" height="3" fill="#aaa" />
      <rect x="13" y="8" width="1" height="3" fill="#aaa" />
      {/* Belt */}
      <rect x="3" y="10" width="10" height="1" fill="#facc15" />
      {/* Legs */}
      <rect x="4" y="11" width="3" height="2" fill="white" />
      <rect x="9" y="11" width="3" height="2" fill="white" />
      {/* Boots */}
      <rect x="3" y="13" width="4" height="1" fill="#888" />
      <rect x="9" y="13" width="4" height="1" fill="#888" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    setUser(null);
    router.push("/");
    router.refresh();
  };

  // Build nav links based on user state
  const navLinks = [
    { href: "/", label: "Home", icon: "home" },
    { href: "/categories", label: "Categories", icon: "categories" },
    { href: "/collections", label: "Collections", icon: "collections" },
  ];

  if (user) {
    navLinks.push({ href: "/bookmarks", label: "Bookmarks", icon: "bookmarks" });
    navLinks.push({ href: "/submit", label: "Submit", icon: "submit" });
  }

  if (user?.role === "admin") {
    navLinks.push({ href: "/admin", label: "Admin", icon: "admin" });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-bd bg-neutral-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-white tracking-tight">
            Create Vault
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-neutral-800 text-white"
                    : "text-white/60 hover:bg-neutral-800/60 hover:text-white"
                }`}
              >
                <NavIcon name={link.icon} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Search */}
        <div className="hidden sm:block w-60">
          <SearchBar />
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-white/60 hover:bg-neutral-800">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Astronaut + Speech Bubble — pinned to very top-right */}
      {user ? (
        <div
          className="fixed top-3 right-4 z-[60] flex items-center gap-2 cursor-pointer"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onClick={handleLogout}
        >
          {/* Pixelated speech bubble */}
          <div className="relative">
            <div className="relative border-2 border-white/60 bg-neutral-950 px-3 py-1" style={{ imageRendering: "pixelated" }}>
              {/* Pixel notch on right side */}
              <div className="absolute -right-[6px] top-1/2 -translate-y-1/2 w-[6px] h-[8px]">
                <div className="absolute top-0 right-0 w-[2px] h-[2px] bg-white/60" />
                <div className="absolute top-[2px] right-0 w-[2px] h-[4px] bg-white/60" />
                <div className="absolute top-[2px] right-[2px] w-[2px] h-[4px] bg-neutral-950" />
                <div className="absolute top-[6px] right-0 w-[2px] h-[2px] bg-white/60" />
              </div>
              <span className="text-xs font-bold text-white whitespace-nowrap" style={{ fontFamily: "monospace" }}>
                {hovering ? "Log out" : `Hi, ${user.name}`}
              </span>
            </div>
          </div>
          <AstronautIcon />
        </div>
      ) : (
        <div className="fixed top-4 right-4 z-[60]">
          <Link
            href="/login"
            className="border border-bd bg-neutral-950 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-white hover:text-black transition-colors"
          >
            Sign In
          </Link>
        </div>
      )}
    </header>
  );
}
