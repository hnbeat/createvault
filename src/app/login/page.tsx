"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "requested" | "pending" | "denied">("idle");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!email.toLowerCase().trim().endsWith("@createadvertising.com")) {
      setError("Only @createadvertising.com emails are allowed");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (data.status === "logged_in") {
        router.push("/");
        router.refresh();
        return;
      }

      if (data.status === "requested") {
        setStatus("requested");
        setMessage(data.message);
        return;
      }

      if (data.status === "pending") {
        setStatus("pending");
        setMessage(data.message);
        return;
      }

      if (data.status === "denied") {
        setStatus("denied");
        setMessage(data.message);
        return;
      }

      setError(data.error || "Something went wrong");
      setStatus("idle");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("idle");
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo area */}
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/auris-logo.svg"
            alt="Auris"
            width={160}
            height={64}
            className="h-10 w-auto"
            priority
          />
          <p className="text-sm text-white/40">
            Your team&apos;s reference library
          </p>
        </div>

        {/* Status messages */}
        {(status === "requested" || status === "pending") && (
          <div className="rounded-xl border border-[#E09055]/30 bg-[#E09055]/5 px-5 py-4 text-center">
            <p className="text-sm font-medium text-[#E09055]">Access Requested</p>
            <p className="mt-1 text-xs text-white/40">{message}</p>
            <p className="mt-3 text-xs text-white/20">An admin will review your request shortly.</p>
          </div>
        )}

        {status === "denied" && (
          <div className="rounded-xl border border-[#D4918A]/30 bg-[#D4918A]/5 px-5 py-4 text-center">
            <p className="text-sm font-medium text-[#D4918A]">Access Denied</p>
            <p className="mt-1 text-xs text-white/40">{message}</p>
          </div>
        )}

        {/* Login form */}
        {(status === "idle" || status === "loading") && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wide text-white/50 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@createadvertising.com"
                className="w-full rounded-lg border border-bd bg-neutral-900 px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400/30 transition-colors"
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm text-[#D4918A]">{error}</p>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-lg bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "..." : "Sign In / Request Access"}
            </button>
          </form>
        )}

        {/* Back to form link */}
        {(status === "requested" || status === "pending" || status === "denied") && (
          <button
            onClick={() => { setStatus("idle"); setEmail(""); setError(""); setMessage(""); }}
            className="w-full text-center text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            Try a different email
          </button>
        )}

        <p className="text-center text-xs text-white/20">
          Only @createadvertising.com accounts can access Auris
        </p>
      </div>
    </div>
  );
}
