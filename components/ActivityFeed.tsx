'use client';

import { useState, useEffect, useCallback } from 'react';
import { TEAM_MEMBERS } from '@/lib/constants';

interface ActivityEntry {
  id: number;
  actor: string;
  action: string;
  context: { type: string; id: number } | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

const selectCls = "px-2 py-1.5 text-sm border-none rounded bg-n-elevated text-n-text outline-none focus:ring-1 focus:ring-n-accent";

export function ActivityFeed() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actorFilter, setActorFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showPost, setShowPost] = useState(false);
  const [postActor, setPostActor] = useState('');
  const [postAction, setPostAction] = useState('');

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

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} className={selectCls} title="Filter by actor (API: ?actor=Kyle)">
          <option value="">All Actors</option>
          {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <div className="flex-1" />
        <button onClick={() => setShowPost(!showPost)} title="Log new activity (API: POST /api/activities)"
          className="px-3 py-1.5 bg-n-accent text-white rounded text-sm font-medium hover:bg-n-accent-hover">
          New
        </button>
      </div>

      {showPost && (
        <div className="bg-n-surface border border-n-border rounded-lg p-4 mb-4">
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
          {entries.map((entry) => (
            <div key={entry.id} className="bg-n-surface border border-n-border rounded-lg p-3 hover:bg-n-hover">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-n-text text-sm">{entry.actor}</span>
                  <span className="text-n-text-secondary text-sm ml-2">{entry.action}</span>
                </div>
                <span className="text-xs text-n-text-dim flex-shrink-0">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </div>
              {entry.context && (
                <div className="mt-1 text-xs text-n-accent">
                  {entry.context.type} #{entry.context.id}
                </div>
              )}
            </div>
          ))}

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
