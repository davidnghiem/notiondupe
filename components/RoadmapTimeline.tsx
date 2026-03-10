'use client';

import { useState, useEffect, useCallback } from 'react';
import { StatusBadge } from './StatusBadge';
import { RoadmapDetail } from './RoadmapDetail';
import { ROADMAP_PHASES, ROADMAP_PHASE_LABELS, ROADMAP_STATUSES, ROADMAP_STATUS_LABELS, TEAM_MEMBERS, getActorColor } from '@/lib/constants';
import { FilterBar } from './MultiSelectFilter';

interface RoadmapItemData {
  id: number;
  title: string;
  description: string | null;
  phase: string;
  status: string;
  assignees: string[];
  startDate: string | null;
  targetDate: string | null;
  owner: string | null;
  estimate: string | null;
  dependencies: number[];
  sortOrder: number;
}

const PHASE_COLORS: Record<string, { text: string; bg: string; border: string }> = {
  immediate:   { text: '#eb5757', bg: 'rgba(235,87,87,0.08)', border: 'rgba(235,87,87,0.25)' },
  short_term:  { text: '#d9730d', bg: 'rgba(217,115,13,0.08)', border: 'rgba(217,115,13,0.25)' },
  medium_term: { text: '#337ea9', bg: 'rgba(51,126,169,0.08)', border: 'rgba(51,126,169,0.25)' },
  long_term:   { text: '#787774', bg: 'rgba(120,119,116,0.08)', border: 'rgba(120,119,116,0.25)' },
};

// Actor colors imported from @/lib/constants

const selectCls = "px-2 py-1.5 text-sm border-none rounded bg-n-elevated text-n-text outline-none focus:ring-1 focus:ring-n-accent";
const inputCls = "w-full px-3 py-2 border border-n-border-strong rounded-lg bg-n-elevated text-n-text focus:ring-1 focus:ring-n-accent outline-none placeholder:text-n-text-dim";

export function RoadmapTimeline() {
  const [items, setItems] = useState<RoadmapItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [multiFilters, setMultiFilters] = useState<Record<string, string[]>>({
    status: ROADMAP_STATUSES.filter((s) => s !== 'complete') as unknown as string[],
  });
  const [showCreate, setShowCreate] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/roadmap');
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

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

  const filteredItems = items.filter((item) => {
    if (multiFilters.phase?.length && !multiFilters.phase.includes(item.phase)) return false;
    if (multiFilters.status?.length && !multiFilters.status.includes(item.status)) return false;
    if (multiFilters.owner?.length && !multiFilters.owner.includes(item.owner || '')) return false;
    return true;
  });

  const grouped = ROADMAP_PHASES.reduce((acc, phase) => {
    acc[phase] = filteredItems.filter((item) => item.phase === phase);
    return acc;
  }, {} as Record<string, RoadmapItemData[]>);

  const roadmapFilters = [
    { key: 'phase', label: 'Phase', options: ROADMAP_PHASES.map((p) => ({ value: p, label: ROADMAP_PHASE_LABELS[p], color: PHASE_COLORS[p]?.text })) },
    { key: 'status', label: 'Status', options: ROADMAP_STATUSES.map((s) => ({ value: s, label: ROADMAP_STATUS_LABELS[s] })) },
    { key: 'owner', label: 'Owner', options: TEAM_MEMBERS.map((m) => ({ value: m, label: m })) },
  ];

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
          availableFilters={roadmapFilters}
          activeFilters={multiFilters}
          onChange={handleFilterChange}
        />
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
            if (multiFilters.phase?.length && !multiFilters.phase.includes(phase)) return null;
            const colors = PHASE_COLORS[phase];
            return (
              <div key={phase}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors.text }} />
                  <h3 className="text-xs font-semibold" style={{ color: colors.text }}>
                    {ROADMAP_PHASE_LABELS[phase]}
                  </h3>
                  <span className="text-xs text-n-text-dim">({phaseItems.length})</span>
                </div>
                {phaseItems.length === 0 ? (
                  <div className="text-sm text-n-text-dim py-2 pl-4">No items</div>
                ) : (
                  <div className="space-y-2">
                    {phaseItems.map((item) => {
                      const ownerColor = getActorColor(item.owner || '');
                      return (
                        <div key={item.id}
                          className="bg-n-surface border rounded-lg p-3 hover:bg-n-hover cursor-pointer transition-colors"
                          style={{ borderColor: colors.border, borderLeftWidth: 3 }}
                          onClick={() => setSelectedId(item.id)}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-medium text-n-text text-sm">{item.title}</h4>
                                <StatusBadge status={item.status} />
                                {item.estimate && (
                                  <span className="text-[11px] px-1.5 py-0.5 rounded-sm bg-[rgba(167,130,195,0.15)] text-[rgba(167,130,195,1)]">
                                    {item.estimate}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-n-text-secondary leading-relaxed">{item.description}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                                {item.owner && (
                                  <span className="inline-flex items-center gap-1.5">
                                    <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                      style={{ backgroundColor: `${ownerColor}20` }}>
                                      <span className="text-[9px] font-semibold" style={{ color: ownerColor }}>{item.owner.charAt(0)}</span>
                                    </span>
                                    <span style={{ color: ownerColor }}>{item.owner}</span>
                                  </span>
                                )}
                                {item.assignees.length > 0 && (
                                  <span className="text-n-text-dim">{item.assignees.join(', ')}</span>
                                )}
                                {item.startDate && item.targetDate && (
                                  <span className="text-n-text-dim">
                                    {new Date(item.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} → {new Date(item.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                  </span>
                                )}
                                {item.dependencies.length > 0 && (
                                  <span className="text-[rgba(235,87,87,0.8)]">Blocked by #{item.dependencies.join(', #')}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
  const [form, setForm] = useState({ title: '', description: '', phase: 'backlog', status: 'backlog', owner: '', estimate: '', assignees: [] as string[], startDate: '', targetDate: '' });

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
      owner: form.owner || undefined,
      estimate: form.estimate || undefined,
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-n-text-dim mb-1">Owner</label>
              <select value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className={inputCls}>
                <option value="">No owner</option>
                {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-n-text-dim mb-1">Estimate</label>
              <input type="text" placeholder="e.g. 2 weeks, 3 sprints" value={form.estimate} onChange={(e) => setForm({ ...form, estimate: e.target.value })} className={inputCls} />
            </div>
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
