'use client';

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
    <nav className="flex gap-0 overflow-x-auto">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          title={tab.tooltip}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm whitespace-nowrap transition-colors border-b-2 ${
            activeTab === tab.id
              ? 'text-n-text border-n-text font-medium'
              : 'text-n-text-secondary border-transparent hover:text-n-text hover:bg-n-hover'
          }`}
        >
          <svg className="w-4 h-4 flex-shrink-0 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
          </svg>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
