'use client';

import { useState } from 'react';
import { TabBar, TabId } from './TabBar';
import { Board } from './Board';
import { IssueList } from './IssueList';
import { RoadmapTimeline } from './RoadmapTimeline';
import { ActivityFeed } from './ActivityFeed';
import { DecisionList } from './DecisionList';
import { DocsPanel } from './DocsPanel';

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('kanban');
  const [showDocs, setShowDocs] = useState(false);

  return (
    <div className="min-h-screen bg-n-bg">
      <header className="bg-n-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between pt-3 pb-1">
            <h1 className="text-base font-semibold text-n-text" title="MWAH CRM Team Project Hub">
              MWAH Project Hub
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDocs(true)}
                className="p-1.5 text-n-text-dim hover:text-n-text hover:bg-n-hover rounded transition-colors"
                title="API docs & usage guide"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <span className="text-xs text-n-text-dim">CRM Team</span>
            </div>
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

      {showDocs && <DocsPanel onClose={() => setShowDocs(false)} />}
    </div>
  );
}
