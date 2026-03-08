'use client';

import { useState, useEffect, useCallback } from 'react';
import { Decision } from '@/lib/schema';
import { StatusBadge } from './StatusBadge';
import { DECISION_STATUSES, DECISION_STATUS_LABELS, DECISION_CATEGORIES } from '@/lib/constants';
import { FilterBar } from './MultiSelectFilter';

const selectCls = "px-2 py-1.5 text-sm border-none rounded bg-n-elevated text-n-text outline-none focus:ring-1 focus:ring-n-accent placeholder:text-n-text-dim";
const inputCls = "w-full px-3 py-2 border border-n-border-strong rounded bg-n-elevated text-n-text focus:ring-1 focus:ring-n-accent outline-none placeholder:text-n-text-dim text-sm";

export function DecisionList() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [multiFilters, setMultiFilters] = useState<Record<string, string[]>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const handleFilterChange = (key: string, selected: string[]) => {
    setMultiFilters((prev) => {
      const next = { ...prev };
      if (selected.length === 0) delete next[key];
      else next[key] = selected;
      return next;
    });
  };

  const fetchDecisions = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);

    const res = await fetch(`/api/decisions?${params}`);
    const data = await res.json();
    setDecisions(data);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchDecisions(); }, [fetchDecisions]);

  const handleCreate = async (data: Record<string, unknown>) => {
    await fetch('/api/decisions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setShowCreate(false);
    fetchDecisions();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this decision?')) return;
    await fetch(`/api/decisions/${id}`, { method: 'DELETE' });
    fetchDecisions();
  };

  const filteredDecisions = decisions.filter((d) => {
    if (multiFilters.status?.length && !multiFilters.status.includes(d.status)) return false;
    if (multiFilters.category?.length && !multiFilters.category.includes(d.category || '')) return false;
    return true;
  });

  const decisionFilters = [
    { key: 'status', label: 'Status', options: DECISION_STATUSES.map((s) => ({ value: s, label: DECISION_STATUS_LABELS[s] })) },
    { key: 'category', label: 'Category', options: DECISION_CATEGORIES.map((c) => ({ value: c, label: c })) },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input type="text" placeholder="Search decisions..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className={`${selectCls} flex-1 min-w-[200px]`} />
        <button onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 bg-n-accent text-white rounded text-sm font-medium hover:bg-n-accent-hover">
          New
        </button>
      </div>
      <div className="mb-4">
        <FilterBar
          availableFilters={decisionFilters}
          activeFilters={multiFilters}
          onChange={handleFilterChange}
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-n-text-dim">Loading decisions...</div>
      ) : filteredDecisions.length === 0 ? (
        <div className="text-center py-8 text-n-text-dim">No decisions found</div>
      ) : (
        <div className="space-y-2">
          {filteredDecisions.map((decision) => (
            <div key={decision.id}
              className="bg-n-surface border border-n-border rounded-lg p-3.5 cursor-pointer hover:bg-n-hover"
              onClick={() => setExpandedId(expandedId === decision.id ? null : decision.id)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-n-text text-sm">{decision.title}</h3>
                    <StatusBadge status={decision.status} />
                    {decision.category && (
                      <span className="text-[11px] text-n-text-dim bg-n-elevated px-1.5 py-0.5 rounded">
                        {decision.category}
                      </span>
                    )}
                  </div>
                  {expandedId === decision.id && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-n-text-secondary whitespace-pre-wrap">{decision.description}</p>
                      {decision.supersededBy && (
                        <p className="text-xs text-n-warning">Superseded by decision #{decision.supersededBy}</p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(decision.id); }}
                          className="px-2 py-1 text-xs text-n-danger border border-n-danger/30 rounded hover:bg-n-danger/10">
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-xs text-n-text-dim flex-shrink-0">
                  {new Date(decision.createdAt!).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateDecisionModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />}
    </div>
  );
}

function CreateDecisionModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({ title: '', description: '', status: 'settled', category: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    onCreate({
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      category: form.category || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-n-surface rounded-xl p-6 w-full max-w-md shadow-xl border border-n-border">
        <h2 className="text-lg font-semibold text-n-text mb-4">New Decision</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="Decision title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} autoFocus />
          <textarea placeholder="Full rationale / description *" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputCls}>
              {DECISION_STATUSES.map((s) => <option key={s} value={s}>{DECISION_STATUS_LABELS[s]}</option>)}
            </select>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
              <option value="">Category</option>
              {DECISION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-n-border-strong text-n-text-secondary rounded-lg hover:bg-n-hover">Cancel</button>
            <button type="submit" disabled={!form.title.trim() || !form.description.trim()} className="flex-1 px-4 py-2 bg-n-accent text-white rounded-lg hover:bg-n-accent-hover disabled:opacity-50 disabled:cursor-not-allowed">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
