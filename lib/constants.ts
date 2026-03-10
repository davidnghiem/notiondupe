export const PRIORITIES = ['P0', 'P1', 'P2', 'P3'] as const;
export const PRIORITY_LABELS: Record<string, string> = { P0: 'Critical', P1: 'High', P2: 'Medium', P3: 'Low' };
export const PRIORITY_COLORS: Record<string, string> = { P0: '#eb5757', P1: '#d9730d', P2: '#cb912f', P3: '#787774' };

export const ISSUE_STATUSES = ['backlog', 'triaged', 'in_progress', 'fixed', 'closed', 'wont_fix'] as const;
export const ISSUE_STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  triaged: 'Triaged',
  in_progress: 'In Progress',
  fixed: 'Fixed',
  closed: 'Closed',
  wont_fix: "Won't Fix",
};

export const COMPONENTS = ['Orders', 'Email', 'Calendar', 'Dashboard', 'Store Detail', 'Contact Detail', 'Admin', 'Map', 'Activity', 'Auth', 'Cloud Functions', 'Other'] as const;

export const ROADMAP_PHASES = ['immediate', 'short_term', 'medium_term', 'long_term'] as const;
export const ROADMAP_PHASE_LABELS: Record<string, string> = {
  immediate: 'Immediate',
  short_term: 'Short-term',
  medium_term: 'Medium-term',
  long_term: 'Long-term',
};

export const ROADMAP_STATUSES = ['backlog', 'mockup', 'approved', 'in_progress', 'complete'] as const;
export const ROADMAP_STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  mockup: 'Mockup Needed',
  approved: 'Approved',
  in_progress: 'In Progress',
  complete: 'Complete',
};

export const DECISION_STATUSES = ['settled', 'open', 'superseded'] as const;
export const DECISION_STATUS_LABELS: Record<string, string> = {
  settled: 'Settled',
  open: 'Open',
  superseded: 'Superseded',
};

export const DECISION_CATEGORIES = ['Architecture', 'Design', 'Security', 'Orders', 'Email', 'Calendar', 'Dashboard', 'Contacts', 'Portal', 'Infrastructure'] as const;

export const TASK_LABELS = ['bug', 'feature', 'chore', 'infrastructure', 'docs', 'review', 'blocked', 'awaiting-merge', 'merged'] as const;


export const ACTOR_COLORS: Record<string, string> = {
  "Kyle": '#d9730d',
  "Nghiem": '#337ea9',
  "Kyle's Claude": '#cb912f',
  "Nghiem's Claude": '#448361',
  "Team": '#9065b0',
};

export function getActorColor(actor: string): string {
  if (ACTOR_COLORS[actor]) return ACTOR_COLORS[actor];
  const normalized = actor.replace(/['']/g, '');
  for (const [key, color] of Object.entries(ACTOR_COLORS)) {
    if (normalized === key.replace(/['']/g, '')) return color;
  }
  const hue = Array.from(actor).reduce((h, c) => h + c.charCodeAt(0), 0) % 360;
  return `hsl(${hue}, 45%, 45%)`;
}

export const TEAM_MEMBERS = ["Kyle", "Nghiem", "Kyle's Claude", "Nghiem's Claude", "Team"] as const;
