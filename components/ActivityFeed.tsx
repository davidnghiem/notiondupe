'use client';

import { useState, useEffect, useCallback } from 'react';
import { TEAM_MEMBERS, getActorColor } from '@/lib/constants';
import { FilterBar } from './MultiSelectFilter';

interface ActivityEntry {
  id: number;
  actor: string;
  action: string;
  context: { type: string; id: number } | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

const selectCls = "px-2 py-1.5 text-sm border-none rounded bg-n-elevated text-n-text outline-none focus:ring-1 focus:ring-n-accent placeholder:text-n-text-dim";

// Actor colors imported from @/lib/constants

export function ActivityFeed() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [multiFilters, setMultiFilters] = useState<Record<string, string[]>>({});
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showPost, setShowPost] = useState(false);
  const [postActor, setPostActor] = useState('');
  const [postAction, setPostAction] = useState('');

  const actorFilter = multiFilters.actor?.[0] || '';

  const fetchEntries = useCallback(async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    const params = new URLSearchParams({ limit: '50', offset: currentOffset.toString() });
    if (actorFilter) params.set('actor', actorFilter);

    const res = await fetch(`/api/activities?${params}`);
    const data = await res.json();

    if (reset) {
      setEntries(data);
      setOffset(50);
    } else {
      setEntries((prev) => [...prev, ...data]);
      setOffset((prev) => prev + 50);
    }
    setHasMore(data.length === 50);
    setLoading(false);
  }, [actorFilter, offset]);

  useEffect(() => {
    setLoading(true);
    setOffset(0);
    fetchEntries(true);
  }, [actorFilter]);

  const handlePost = async () => {
    if (!postActor.trim() || !postAction.trim()) return;
    await fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor: postActor.trim(), action: postAction.trim() }),
    });
    setPostActor('');
    setPostAction('');
    setShowPost(false);
    fetchEntries(true);
  };

  const handleFilterChange = (key: string, selected: string[]) => {
    setMultiFilters((prev) => {
      const next = { ...prev };
      if (selected.length === 0) delete next[key];
      else next[key] = selected;
      return next;
    });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <FilterBar
          availableFilters={[
            { key: 'actor', label: 'Actor', options: TEAM_MEMBERS.map((m) => ({ value: m, label: m })) },
          ]}
          activeFilters={multiFilters}
          onChange={handleFilterChange}
        />
        <div className="flex-1" />
        <button onClick={() => setShowPost(!showPost)} title="Log new activity (API: POST /api/activities)"
          className="px-3 py-1.5 bg-n-accent text-white rounded text-sm font-medium hover:bg-n-accent-hover">
          New
        </button>
      </div>

      {showPost && (
        <div className="bg-n-surface border border-n-border rounded-xl p-4 mb-4">
          <div className="flex gap-2 mb-2">
            <select value={postActor} onChange={(e) => setPostActor(e.target.value)}
              className={`${selectCls} flex-shrink-0`}>
              <option value="">Who?</option>
              {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <input type="text" placeholder="What did you do?" value={postAction}
              onChange={(e) => setPostAction(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm border border-n-border-strong rounded bg-n-elevated text-n-text outline-none placeholder:text-n-text-dim focus:ring-1 focus:ring-n-accent"
              onKeyDown={(e) => e.key === 'Enter' && handlePost()} />
            <button onClick={handlePost} disabled={!postActor || !postAction.trim()}
              className="px-3 py-1.5 bg-n-success text-white rounded-lg text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">
              Post
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-n-text-dim">Loading activity...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-n-text-dim">No activity yet</div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const color = getActorColor(entry.actor);
            const isBot = entry.actor.includes('Claude');
            return (
              <div key={entry.id} className="bg-n-surface border border-n-border rounded-xl p-3 hover:bg-n-hover">
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    {isBot ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color }}>
                        <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7v1h1a2 2 0 110 4h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a2 2 0 110-4h1v-1a7 7 0 017-7h1V5.73A2 2 0 0112 2z" fill="currentColor" opacity="0.9"/>
                        <circle cx="9" cy="14" r="1.5" fill="white"/>
                        <circle cx="15" cy="14" r="1.5" fill="white"/>
                      </svg>
                    ) : (
                      <span className="text-xs font-semibold" style={{ color }}>{entry.actor.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-medium text-sm" style={{ color }}>{entry.actor}</span>
                      <span className="text-xs text-n-text-dim flex-shrink-0">
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-n-text mt-0.5 leading-relaxed">{entry.action}</p>
                    {entry.context && (
                      <span
                        className="inline-flex items-center gap-1 mt-1.5 text-xs px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: `${color}15`, color }}
                      >
                        {entry.context.type} #{entry.context.id}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {hasMore && (
            <button onClick={() => fetchEntries(false)}
              className="w-full py-2 text-sm text-n-accent hover:text-n-accent-hover">
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}
