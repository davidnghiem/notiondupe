'use client';

import { useState, useEffect, useCallback } from 'react';
import { Issue } from '@/lib/schema';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { PRIORITIES, ISSUE_STATUSES, ISSUE_STATUS_LABELS, COMPONENTS, TEAM_MEMBERS } from '@/lib/constants';

export function IssueList() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ priority: '', status: '', component: '', assignee: '', search: '' });
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchIssues = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.status) params.set('status', filters.status);
    if (filters.component) params.set('component', filters.component);
    if (filters.assignee) params.set('assignee', filters.assignee);
    if (filters.search) params.set('search', filters.search);

    const res = await fetch(`/api/issues?${params}`);
    const data = await res.json();
    setIssues(data);
    setLoading(false);
  }, [filters]);

  useEffect(() => { fetchIssues(); }, [fetchIssues]);

  const handleStatusChange = async (id: number, status: string) => {
    await fetch(`/api/issues/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchIssues();
  };

  const handleCreate = async (data: Partial<Issue>) => {
    await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setShowCreate(false);
    fetchIssues();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this issue?')) return;
    await fetch(`/api/issues/${id}`, { method: 'DELETE' });
    setSelectedIssue(null);
    fetchIssues();
  };

  const selectCls = "px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none";

  return (
    <div>
      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text" placeholder="Search issues..."
          value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          className={`${selectCls} flex-1 min-w-[200px]`}
        />
        <select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} className={selectCls}>
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className={selectCls}>
          <option value="">All Statuses</option>
          {ISSUE_STATUSES.map((s) => <option key={s} value={s}>{ISSUE_STATUS_LABELS[s]}</option>)}
        </select>
        <select value={filters.component} onChange={(e) => setFilters({ ...filters, component: e.target.value })} className={selectCls}>
          <option value="">All Components</option>
          {COMPONENTS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.assignee} onChange={(e) => setFilters({ ...filters, assignee: e.target.value })} className={selectCls}>
          <option value="">All Assignees</option>
          {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <button onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors">
          + New Issue
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading issues...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                <th className="py-2 pr-4 text-gray-500 dark:text-gray-400 font-medium">Priority</th>
                <th className="py-2 pr-4 text-gray-500 dark:text-gray-400 font-medium">Title</th>
                <th className="py-2 pr-4 text-gray-500 dark:text-gray-400 font-medium">Status</th>
                <th className="py-2 pr-4 text-gray-500 dark:text-gray-400 font-medium">Component</th>
                <th className="py-2 pr-4 text-gray-500 dark:text-gray-400 font-medium">Assignee</th>
                <th className="py-2 text-gray-500 dark:text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                  onClick={() => setSelectedIssue(issue)}>
                  <td className="py-2.5 pr-4"><PriorityBadge priority={issue.priority} /></td>
                  <td className="py-2.5 pr-4 text-gray-900 dark:text-gray-100 font-medium">{issue.title}</td>
                  <td className="py-2.5 pr-4"><StatusBadge status={issue.status} /></td>
                  <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400">{issue.component || '—'}</td>
                  <td className="py-2.5 pr-4 text-gray-600 dark:text-gray-400">{issue.assignee || '—'}</td>
                  <td className="py-2.5">
                    <select
                      value={issue.status}
                      onChange={(e) => { e.stopPropagation(); handleStatusChange(issue.id, e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs px-1.5 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                    >
                      {ISSUE_STATUSES.map((s) => <option key={s} value={s}>{ISSUE_STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {issues.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-gray-500">No issues found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedIssue(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <PriorityBadge priority={selectedIssue.priority} />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selectedIssue.title}</h2>
              </div>
              <button onClick={() => setSelectedIssue(null)} className="text-gray-400 hover:text-gray-600">&#x2715;</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex gap-2"><StatusBadge status={selectedIssue.status} /></div>
              {selectedIssue.description && <p className="text-gray-700 dark:text-gray-300">{selectedIssue.description}</p>}
              <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-400">
                <div>Component: {selectedIssue.component || '—'}</div>
                <div>Assignee: {selectedIssue.assignee || '—'}</div>
                <div>Reporter: {selectedIssue.reporter || '—'}</div>
                <div>Found in: {selectedIssue.versionFound || '—'}</div>
                <div>Fixed in: {selectedIssue.versionFixed || '—'}</div>
              </div>
              {selectedIssue.stepsToReproduce && (
                <div>
                  <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">Steps to Reproduce</div>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selectedIssue.stepsToReproduce}</p>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button onClick={() => handleDelete(selectedIssue.id)}
                  className="px-3 py-1.5 text-red-600 border border-red-300 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/20">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateIssueModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}
    </div>
  );
}

function CreateIssueModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: Record<string, unknown>) => void }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'P2', component: '', assignee: '', reporter: '', stepsToReproduce: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onCreate({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      priority: form.priority,
      component: form.component || undefined,
      assignee: form.assignee || undefined,
      reporter: form.reporter || undefined,
      stepsToReproduce: form.stepsToReproduce.trim() || undefined,
    });
  };

  const inputCls = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">New Issue</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="Issue title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} autoFocus />
          <textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputCls} resize-none`} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className={inputCls}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={form.component} onChange={(e) => setForm({ ...form, component: e.target.value })} className={inputCls}>
              <option value="">Component</option>
              {COMPONENTS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.assignee} onChange={(e) => setForm({ ...form, assignee: e.target.value })} className={inputCls}>
              <option value="">Assignee</option>
              {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={form.reporter} onChange={(e) => setForm({ ...form, reporter: e.target.value })} className={inputCls}>
              <option value="">Reporter</option>
              {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <textarea placeholder="Steps to reproduce" rows={2} value={form.stepsToReproduce} onChange={(e) => setForm({ ...form, stepsToReproduce: e.target.value })} className={`${inputCls} resize-none`} />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" disabled={!form.title.trim()} className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
