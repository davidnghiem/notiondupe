'use client';

export function LabelPill({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium"
      style={{ backgroundColor: 'rgba(100,116,139,0.12)', color: '#647487' }}
    >
      {label}
    </span>
  );
}
