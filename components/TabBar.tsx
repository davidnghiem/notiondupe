'use client';

const TAB_COLORS: Record<string, { active: string; border: string; iconBg: string }> = {
  kanban:    { active: '#337ea9', border: '#337ea9', iconBg: 'rgba(51,126,169,0.12)' },
  issues:    { active: '#d44c47', border: '#d44c47', iconBg: 'rgba(212,76,71,0.12)' },
  roadmap:   { active: '#cb912f', border: '#cb912f', iconBg: 'rgba(203,145,47,0.12)' },
  activity:  { active: '#448361', border: '#448361', iconBg: 'rgba(68,131,97,0.12)' },
  decisions: { active: '#9065b0', border: '#9065b0', iconBg: 'rgba(144,101,176,0.12)' },
};

const TABS = [
  { id: 'kanban', label: 'Kanban', tooltip: 'Drag-and-drop task board (API: /api/tasks, /api/board)', icon: 'M4 6h4v4H4V6zm0 8h4v4H4v-4zm6-8h4v4h-4V6zm0 8h4v4h-4v-4zm6-8h4v4h-4V6zm0 8h4v4h-4v-4z' },
  { id: 'issues', label: 'Issues', tooltip: 'Bug & issue tracker (API: /api/issues)', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'roadmap', label: 'Roadmap', tooltip: 'Feature planning timeline (API: /api/roadmap)', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'activity', label: 'Activity', tooltip: 'Append-only audit log (API: /api/activities) — no edits, no deletes', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'decisions', label: 'Decisions', tooltip: 'Architectural decision log (API: /api/decisions)', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
] as const;

export type TabId = typeof TABS[number]['id'];

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="flex gap-0.5 overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const colors = TAB_COLORS[tab.id];
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            title={tab.tooltip}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap transition-colors border-b-2 ${
              isActive
                ? 'font-medium'
                : 'text-n-text-secondary border-transparent hover:text-n-text hover:bg-n-hover'
            }`}
            style={isActive ? { color: colors.active, borderBottomColor: colors.border } : undefined}
          >
            <span
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
              style={isActive ? { backgroundColor: colors.iconBg } : undefined}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                style={isActive ? { color: colors.active, opacity: 1 } : { opacity: 0.5 }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
              </svg>
            </span>
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
