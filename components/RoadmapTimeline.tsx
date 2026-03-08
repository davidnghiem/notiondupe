'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatusBadge } from './StatusBadge';
import { ROADMAP_PHASES, ROADMAP_PHASE_LABELS, ROADMAP_STATUSES, ROADMAP_STATUS_LABELS, TEAM_MEMBERS } from '@/lib/constants';

interface RoadmapItemData {
  id: number;
  title: string;
  description: string | null;
  phase: string;
  status: string;
  assignees: string[];
  startDate: string | null;
  targetDate: string | null;
  dependencies: number[];
  sortOrder: number;
}

export function RoadmapTimeline() {
  const [items, setItems] = useState<RoadmapItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ phase: '', status: '', assignee: '' });
  const [showCreate, setShowCreate] = useState(false);

  const fetchItems = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.phase) params.set('phase', filters.phase);
    if (filters.status) params.set('status', filters.status);
    const res = await fetch(`/api/roadmap?${params}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleCreate = async (data: Record<string, unknown>) => {
    await fetch('/api/roadmap', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setShowCreate(false);
    fetchItems();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this roadmap item?')) return;
    await fetch(`/api/roadmap/${id}`, { method: 'DELETE' });
    fetchItems();
  };

  const grouped = ROADMAP_PHASES.reduce((acc, phase) => {
    acc[phase] = items.filter((item) => item.phase === phase);
    return acc;
  }, {} as Record<string, RoadmapItemData[]>);

  const selectCls = "px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none";

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <select value={filters.phase} onChange={(e) => setFilters({ ...filters, phase: e.target.value })} className={selectCls}>
          <option value="">All Phases</option>
          {ROADMAP_PHASES.map((p) => <option key={p} value={p}>{ROADMAP_PHASE_LABELS[p]}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={selectCls}>
          <option value="">All Statuses</option>
          {ROADMAP_STATUSES.map((s) => <option key={s} value={s}>{ROADMAP_STATUS_LABELS[s]}</option>)}
        </select>
        <div className="flex-1" />
        <button onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
          + New Item
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading roadmap...</div>
      ) : (
        <div className="space-y-6">
          {ROADMAP_PHASES.map((phase) => {
            const phaseItems = grouped[phase];
            if (filters.phase && filters.phase !== phase) return null;
            return (
              <div key={phase}>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {ROADMAP_PHASE_LABELS[phase]}
                  <span className="ml-2 text-gray-400">({phaseItems.length})</span>
                </h3>
                {phaseItems.length === 0 ? (
                  <div className="text-sm text-gray-400 py-2">No items</div>
                ) : (
                  <div className="space-y-2">
                    {phaseItems.map((item) => (
                      <div key={item.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{item.title}</h4>
                              <StatusBadge status={item.status} />
                            </div>
                            {item.description && (
                              <p className="text-xs text-gray-600 dark:text-gray-400">{item.description}</p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {item.assignees.length > 0 && (
                                <span>{item.assignees.join(', ')}</span>
                              )}
                              {item.startDate && item.targetDate && (
                                <span>{new Date(item.startDate).toLocaleDateString()} → {new Date(item.targetDate).toLocaleDateString()}</span>
                              )}
                              {item.dependencies.length > 0 && (
                                <span className="text-orange-500">Depends on: #{item.dependencies.join(', #')}</span>
                              )}
                            </div>
                          </div>
                          <button onClick={() => handleDelete(item.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0" title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showCreate && <CreateRoadmapModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  );
}

function CreateRoadmapModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({ title: '', description: '', phase: 'backlog', status: 'backlog', assignees: [] as string[], startDate: '', targetDate: '' });

  const toggleAssignee = (member: string) => {
    setForm((prev) => ({
      ...prev,
      assignees: prev.assignees.includes(member)
        ? prev.assignees.filter((a) => a !== member)
        : [...prev.assignees, member],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onCreate({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      phase: form.phase,
      status: form.status,
      assignees: form.assignees,
      startDate: form.startDate || undefined,
      targetDate: form.targetDate || undefined,
    });
  };

  const inputCls = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">New Roadmap Item</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} autoFocus />
          <textarea placeholder="Description" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.phase} onChange={(e) => setForm({ ...form, phase: e.target.value })} className={inputCls}>
              {ROADMAP_PHASES.map((p) => <option key={p} value={p}>{ROADMAP_PHASE_LABELS[p]}</option>)}
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
              {ROADMAP_STATUSES.map((s) => <option key={s} value={s}>{ROADMAP_STATUS_LABELS[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignees</label>
            <div className="flex flex-wrap gap-1.5">
              {TEAM_MEMBERS.map((m) => (
                <button key={m} type="button" onClick={() => toggleAssignee(m)}
                  className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                    form.assignees.includes(m) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>{m}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Target Date</label>
              <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={!form.title.trim()} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
