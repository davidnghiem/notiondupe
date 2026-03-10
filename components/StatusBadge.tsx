'use client';

// Notion-style colored pill badges with semi-transparent backgrounds
const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  // Issue statuses
  backlog:     { bg: 'rgba(151,151,151,0.15)', text: 'rgba(155,155,155,1)',   dot: 'rgba(155,155,155,1)' },
  triaged:     { bg: 'rgba(167,130,195,0.15)', text: 'rgba(167,130,195,1)',   dot: 'rgba(167,130,195,1)' },
  in_progress: { bg: 'rgba(73,144,226,0.15)',  text: 'rgba(73,144,226,1)',    dot: 'rgba(73,144,226,1)' },
  fixed:       { bg: 'rgba(77,171,154,0.15)',   text: 'rgba(77,171,154,1)',    dot: 'rgba(77,171,154,1)' },
  closed:      { bg: 'rgba(120,119,116,0.15)',  text: 'rgba(120,119,116,1)',   dot: 'rgba(120,119,116,1)' },
  wont_fix:    { bg: 'rgba(235,87,87,0.15)',    text: 'rgba(235,87,87,1)',     dot: 'rgba(235,87,87,1)' },
  // Roadmap statuses
  mockup:      { bg: 'rgba(203,145,47,0.15)',   text: 'rgba(203,145,47,1)',    dot: 'rgba(203,145,47,1)' },
  approved:    { bg: 'rgba(73,144,226,0.15)',   text: 'rgba(73,144,226,1)',    dot: 'rgba(73,144,226,1)' },
  complete:    { bg: 'rgba(77,171,154,0.15)',   text: 'rgba(77,171,154,1)',    dot: 'rgba(77,171,154,1)' },
  // Decision statuses
  settled:     { bg: 'rgba(77,171,154,0.15)',   text: 'rgba(77,171,154,1)',    dot: 'rgba(77,171,154,1)' },
  decided:     { bg: 'rgba(73,144,226,0.15)',   text: 'rgba(73,144,226,1)',    dot: 'rgba(73,144,226,1)' },
  open:        { bg: 'rgba(203,145,47,0.15)',   text: 'rgba(203,145,47,1)',    dot: 'rgba(203,145,47,1)' },
  superseded:  { bg: 'rgba(120,119,116,0.15)',  text: 'rgba(120,119,116,1)',   dot: 'rgba(120,119,116,1)' },
};

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog', triaged: 'Triaged', in_progress: 'In progress', fixed: 'Fixed',
  closed: 'Closed', wont_fix: "Won't fix",
  mockup: 'Mockup needed', approved: 'Approved', complete: 'Complete',
  settled: 'Settled', decided: 'Decided', open: 'Open', superseded: 'Superseded',
};

export function StatusBadge({ status, variant }: { status: string; variant?: 'pill' | 'dot' }) {
  const config = STATUS_CONFIG[status] || { bg: 'rgba(151,151,151,0.15)', text: 'rgba(155,155,155,1)', dot: 'rgba(155,155,155,1)' };
  const label = STATUS_LABELS[status] || status;

  if (variant === 'dot') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: config.text }}>
        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: config.dot }} />
        {label}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium whitespace-nowrap"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {label}
    </span>
  );
}
