'use client';

const STATUS_COLORS: Record<string, string> = {
  // Issue statuses
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  triaged: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  fixed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  verified: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  closed: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  wont_fix: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  // Roadmap statuses
  backlog: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  mockup: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  done: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  // Decision statuses
  settled: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  open: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  superseded: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

const STATUS_LABELS: Record<string, string> = {
  new: 'New', triaged: 'Triaged', in_progress: 'In Progress', fixed: 'Fixed',
  verified: 'Verified', closed: 'Closed', wont_fix: "Won't Fix",
  backlog: 'Backlog', mockup: 'Mockup', approved: 'Approved', done: 'Done',
  settled: 'Settled', open: 'Open', superseded: 'Superseded',
};

export function StatusBadge({ status }: { status: string }) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
  const label = STATUS_LABELS[status] || status;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}
