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

  const selectCls = "px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none";

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select value={actorFilter} onChange={(e) => setActorFilter(e.target.value)} className={selectCls}>
          <option value="">All Actors</option>
          {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <div className="flex-1" />
        <button onClick={() => setShowPost(!showPost)}
          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
          + Post Entry
        </button>
      </div>

      {showPost && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
          <div className="flex gap-2 mb-2">
            <select value={postActor} onChange={(e) => setPostActor(e.target.value)}
              className={`${selectCls} flex-shrink-0`}>
              <option value="">Who?</option>
              {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <input type="text" placeholder="What did you do?" value={postAction}
              onChange={(e) => setPostAction(e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handlePost()} />
            <button onClick={handlePost} disabled={!postActor || !postAction.trim()}
              className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed">
              Post
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading activity...</div>
      ) : entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No activity yet</div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{entry.actor}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">{entry.action}</span>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(entry.createdAt).toLocaleString()}
                </span>
              </div>
              {entry.context && (
                <div className="mt-1 text-xs text-blue-500">
                  {entry.context.type} #{entry.context.id}
                </div>
              )}
            </div>
          ))}

          {hasMore && (
            <button onClick={() => fetchEntries(false)}
              className="w-full py-2 text-sm text-blue-500 hover:text-blue-600 transition-colors">
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}
