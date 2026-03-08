'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatusBadge } from './StatusBadge';
import { RoadmapDetail } from './RoadmapDetail';
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

const selectCls = "px-2 py-1.5 text-sm border-none rounded bg-n-elevated text-n-text outline-none focus:ring-1 focus:ring-n-accent";
const inputCls = "w-full px-3 py-2 border border-n-border-strong rounded-lg bg-n-elevated text-n-text focus:ring-1 focus:ring-n-accent outline-none placeholder:text-n-text-dim";

export function RoadmapTimeline() {
  const [items, setItems] = useState<RoadmapItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ phase: '', status: '', assignee: '' });
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

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
    await fetch(`/api/roadmap/${id}`, { method: 'DELETE' });
    setSelectedId(null);
    fetchItems();
  };

  const grouped = ROADMAP_PHASES.reduce((acc, phase) => {
    acc[phase] = items.filter((item) => item.phase === phase);
    return acc;
  }, {} as Record<string, RoadmapItemData[]>);

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
          className="px-3 py-1.5 bg-n-accent text-white rounded-lg text-sm hover:bg-n-accent-hover">
          New
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-n-text-dim">Loading roadmap...</div>
      ) : (
        <div className="space-y-6">
          {ROADMAP_PHASES.map((phase) => {
            const phaseItems = grouped[phase];
            if (filters.phase && filters.phase !== phase) return null;
            return (
              <div key={phase}>
                <h3 className="text-xs font-medium text-n-text-secondary mb-3">
                  {ROADMAP_PHASE_LABELS[phase]}
                  <span className="ml-2 font-normal">({phaseItems.length})</span>
                </h3>
                {phaseItems.length === 0 ? (
                  <div className="text-sm text-n-text-dim py-2">No items</div>
                ) : (
                  <div className="space-y-2">
                    {phaseItems.map((item) => (
                      <div key={item.id} className="bg-n-surface border border-n-border rounded-lg p-3 hover:bg-n-hover cursor-pointer"
                        onClick={() => setSelectedId(item.id)}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-n-text text-sm">{item.title}</h4>
                            <StatusBadge status={item.status} />
                          </div>
                          {item.description && (
                            <p className="text-xs text-n-text-secondary">{item.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-n-text-dim">
                            {item.assignees.length > 0 && (
                              <span>{item.assignees.join(', ')}</span>
                            )}
                            {item.startDate && item.targetDate && (
                              <span>{new Date(item.startDate).toLocaleDateString()} → {new Date(item.targetDate).toLocaleDateString()}</span>
                            )}
                            {item.dependencies.length > 0 && (
                              <span className="text-n-warning">Depends on: #{item.dependencies.join(', #')}</span>
                            )}
                          </div>
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

      {selectedId && (
        <RoadmapDetail
          itemId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdate={fetchItems}
          onDelete={handleDelete}
        />
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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-n-surface rounded-xl p-6 w-full max-w-md shadow-xl border border-n-border max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-n-text mb-4">New Roadmap Item</h2>
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
            <label className="block text-sm font-medium text-n-text-secondary mb-1">Assignees</label>
            <div className="flex flex-wrap gap-1.5">
              {TEAM_MEMBERS.map((m) => (
                <button key={m} type="button" onClick={() => toggleAssignee(m)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    form.assignees.includes(m) ? 'bg-n-accent text-white' : 'bg-n-elevated text-n-text-secondary hover:bg-n-hover'
                  }`}>{m}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-n-text-dim mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-n-text-dim mb-1">Target Date</label>
              <input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-n-border-strong text-n-text-secondary rounded-lg hover:bg-n-hover">Cancel</button>
            <button type="submit" disabled={!form.title.trim()} className="flex-1 px-4 py-2 bg-n-accent text-white rounded-lg hover:bg-n-accent-hover disabled:opacity-50 disabled:cursor-not-allowed">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
