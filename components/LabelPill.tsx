'use client';

export function LabelPill({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide"
      style={{ backgroundColor: 'rgba(100,116,139,0.12)', color: '#615d59' }}
    >
      {label}
    </span>
  );
}
