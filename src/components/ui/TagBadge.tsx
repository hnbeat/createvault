interface TagBadgeProps {
  name: string;
}

export function TagBadge({ name }: TagBadgeProps) {
  return (
    <span className="inline-flex items-center rounded border border-bd px-2.5 py-1 text-xs font-medium text-white/80 uppercase tracking-wide">
      {name}
    </span>
  );
}
