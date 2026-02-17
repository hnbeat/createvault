import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-white/10">404</h1>
      <p className="mt-4 text-lg text-white/60">This page could not be found.</p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black hover:bg-white/90 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
