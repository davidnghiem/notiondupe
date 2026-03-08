'use client';

import { PRIORITY_LABELS } from '@/lib/constants';

// Notion-style colored pill badges
const PRIORITY_STYLES: Record<string, { bg: string; text: string }> = {
  P0: { bg: 'rgba(235,87,87,0.15)',  text: 'rgba(235,87,87,1)' },
  P1: { bg: 'rgba(217,115,13,0.15)', text: 'rgba(217,115,13,1)' },
  P2: { bg: 'rgba(203,145,47,0.15)', text: 'rgba(203,145,47,1)' },
  P3: { bg: 'rgba(120,119,116,0.15)', text: 'rgba(120,119,116,1)' },
};

export function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null;
  const style = PRIORITY_STYLES[priority] || PRIORITY_STYLES.P3;
  const label = PRIORITY_LABELS[priority] || priority;

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium whitespace-nowrap"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {label}
    </span>
  );
}
