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
    <div className="min-h-screen bg-n-bg">
      <header className="bg-n-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pt-3 pb-1">
            <h1 className="text-base font-semibold text-n-text">
              MWAH Project Hub
            </h1>
            <span className="text-xs text-n-text-dim">
              CRM Team
            </span>
          </div>
          <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <div className="border-b border-n-border" />
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
