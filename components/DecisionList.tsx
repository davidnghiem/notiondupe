'use client';

import { useState, useEffect, useCallback } from 'react';
import { Decision } from '@/lib/schema';
import { StatusBadge } from './StatusBadge';
import { DECISION_STATUSES, DECISION_STATUS_LABELS, DECISION_CATEGORIES } from '@/lib/constants';

export function DecisionList() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', search: '' });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchDecisions = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.category) params.set('category', filters.category);
    if (filters.search) params.set('search', filters.search);

    const res = await fetch(`/api/decisions?${params}`);
    const data = await res.json();
    setDecisions(data);
    setLoading(false);
  }, [filters]);

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

  const selectCls = "px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none";

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input type="text" placeholder="Search decisions..."
          value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className={`${selectCls} flex-1 min-w-[200px]`} />
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={selectCls}>
          <option value="">All Statuses</option>
          {DECISION_STATUSES.map((s) => <option key={s} value={s}>{DECISION_STATUS_LABELS[s]}</option>)}
        </select>
        <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className={selectCls}>
          <option value="">All Categories</option>
          {DECISION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <button onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
          + New Decision
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading decisions...</div>
      ) : decisions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No decisions found</div>
      ) : (
        <div className="space-y-3">
          {decisions.map((decision) => (
            <div key={decision.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              onClick={() => setExpandedId(expandedId === decision.id ? null : decision.id)}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{decision.title}</h3>
                    <StatusBadge status={decision.status} />
                    {decision.category && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                        {decision.category}
                      </span>
                    )}
                  </div>
                  {expandedId === decision.id && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{decision.description}</p>
                      {decision.supersededBy && (
                        <p className="text-xs text-orange-500">Superseded by decision #{decision.supersededBy}</p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(decision.id); }}
                          className="px-2 py-1 text-xs text-red-600 border border-red-300 rounded hover:bg-red-50 dark:hover:bg-red-900/20">
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
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

  const inputCls = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">New Decision</h2>
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
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={!form.title.trim() || !form.description.trim()} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
