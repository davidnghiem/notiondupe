'use client';

export function LabelPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-n-elevated text-n-text-secondary">
      {label}
    </span>
  );
}
