'use client';

const TABS = [
  { id: 'kanban', label: 'Kanban' },
  { id: 'issues', label: 'Issues' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'activity', label: 'Activity' },
  { id: 'decisions', label: 'Decisions' },
] as const;

export type TabId = typeof TABS[number]['id'];

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <nav className="flex gap-0 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
