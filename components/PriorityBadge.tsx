'use client';

import { PRIORITY_LABELS, PRIORITY_COLORS } from '@/lib/constants';

export function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null;
  const label = PRIORITY_LABELS[priority] || priority;
  const color = PRIORITY_COLORS[priority] || '#6B7280';

  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold text-white"
      style={{ backgroundColor: color }}
    >
      {priority}
    </span>
  );
}
