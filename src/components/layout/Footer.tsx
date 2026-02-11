export function Footer() {
  return (
    <footer className="border-t border-bd bg-neutral-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/50">
            CreateVault — Your team&apos;s reference starting point
          </p>
          <p className="text-xs text-white/30">
            Built with Next.js, Tailwind CSS & Drizzle ORM
          </p>
        </div>
      </div>
    </footer>
  );
}
