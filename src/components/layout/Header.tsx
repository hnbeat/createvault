"use client";

import Link from "next/link";
import Image from "next/image";
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
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex flex-col items-start shrink-0">
          <Image
            src="/auris-logo.svg"
            alt="Auris"
            width={100}
            height={40}
            className="h-7 w-auto"
            priority
          />
          <span className="uppercase tracking-[0.3em] text-white/40 font-medium leading-none mt-0.5" style={{ fontSize: "7px" }}>
            Vault
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
                    : "text-neutral-50/60 hover:bg-neutral-800/60 hover:text-white"
                }`}
              >
                <NavIcon name={link.icon} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <div className="hidden sm:block w-60 shrink-0">
          <SearchBar />
        </div>

        {/* User area */}
        <div className="shrink-0">
          {user ? (
            <div
              className="flex items-center cursor-pointer group"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              onClick={handleLogout}
            >
              <div className="rounded-lg border border-bd bg-neutral-900/60 px-3 py-1.5 transition-colors group-hover:border-bd-light">
                <span className="text-xs font-medium text-neutral-50/70 whitespace-nowrap group-hover:text-white transition-colors">
                  {hovering ? "Log out" : `Hi, ${user.name}`}
                </span>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-bd bg-neutral-900/60 px-4 py-1.5 text-xs font-medium text-neutral-50/70 hover:bg-white hover:text-black hover:border-white transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden flex items-center justify-center w-10 h-10 shrink-0 rounded-lg text-white/60 hover:bg-neutral-800">
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
    </header>
  );
}
