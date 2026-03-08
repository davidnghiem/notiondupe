'use client';

import { useState } from 'react';
import { TabBar, TabId } from './TabBar';
import { Board } from './Board';
import { IssueList } from './IssueList';
import { RoadmapTimeline } from './RoadmapTimeline';
import { ActivityFeed } from './ActivityFeed';
import { DecisionList } from './DecisionList';

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('kanban');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              MWAH Project Hub
            </h1>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              CRM Team
            </span>
          </div>
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === 'kanban' && <Board />}
        {activeTab === 'issues' && <IssueList />}
        {activeTab === 'roadmap' && <RoadmapTimeline />}
        {activeTab === 'activity' && <ActivityFeed />}
        {activeTab === 'decisions' && <DecisionList />}
      </main>
    </div>
  );
}
