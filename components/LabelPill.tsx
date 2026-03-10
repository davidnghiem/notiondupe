'use client';

import { LABEL_COLORS } from '@/lib/constants';

export function LabelPill({ label }: { label: string }) {
  const colors = LABEL_COLORS[label];

  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium"
      style={colors
        ? { backgroundColor: colors.bg, color: colors.text }
        : undefined
      }
    >
      {label}
    </span>
  );
}
