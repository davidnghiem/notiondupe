'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Issue } from '@/lib/schema';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { IssueDetail } from './IssueDetail';
import { PRIORITIES, PRIORITY_LABELS, PRIORITY_COLORS, ISSUE_STATUSES, ISSUE_STATUS_LABELS, COMPONENTS, TEAM_MEMBERS } from '@/lib/constants';
import { FilterBar } from './MultiSelectFilter';

type SortKey = 'priority' | 'title' | 'status' | 'component' | 'assignee' | 'created' | null;
type SortDir = 'asc' | 'desc';

const PRIORITY_ORDER: Record<string, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
const STATUS_ORDER: Record<string, number> = Object.fromEntries(
  (ISSUE_STATUSES as readonly string[]).map((s, i) => [s, i])
);

const selectCls = "px-2 py-1.5 text-sm border-none rounded bg-n-elevated text-n-text outline-none focus:ring-1 focus:ring-n-accent placeholder:text-n-text-dim";
const inputCls = "w-full px-3 py-2 border border-n-border-strong rounded bg-n-elevated text-n-text focus:ring-1 focus:ring-n-accent outline-none placeholder:text-n-text-dim text-sm";

export function IssueList() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [multiFilters, setMultiFilters] = useState<Record<string, string[]>>({});
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('priority');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else { setSortKey(null); setSortDir('asc'); }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      if (multiFilters.priority?.length && !multiFilters.priority.includes(issue.priority)) return false;
      if (multiFilters.status?.length && !multiFilters.status.includes(issue.status)) return false;
      if (multiFilters.component?.length && !multiFilters.component.includes(issue.component || '')) return false;
      if (multiFilters.assignee?.length && !multiFilters.assignee.includes(issue.assignee || '')) return false;
      return true;
    });
  }, [issues, multiFilters]);

  const sortedIssues = useMemo(() => {
    if (!sortKey) return filteredIssues;
    return [...filteredIssues].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'priority':
          cmp = (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99);
          break;
        case 'status':
          cmp = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
          break;
        case 'title':
          cmp = (a.title || '').localeCompare(b.title || '');
          break;
        case 'component':
          cmp = (a.component || '').localeCompare(b.component || '');
          break;
        case 'assignee':
          cmp = (a.assignee || '').localeCompare(b.assignee || '');
          break;
        case 'created':
          cmp = (a.createdAt ? new Date(a.createdAt).getTime() : 0) - (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredIssues, sortKey, sortDir]);

  const issueFilters = [
    { key: 'priority', label: 'Priority', options: PRIORITIES.map((p) => ({ value: p, label: `${p} — ${PRIORITY_LABELS[p]}`, color: PRIORITY_COLORS[p] })) },
    { key: 'status', label: 'Status', options: ISSUE_STATUSES.map((s) => ({ value: s, label: ISSUE_STATUS_LABELS[s] })) },
    { key: 'component', label: 'Component', options: COMPONENTS.map((c) => ({ value: c, label: c })) },
    { key: 'assignee', label: 'Assignee', options: TEAM_MEMBERS.map((m) => ({ value: m, label: m })) },
  ];

  const handleFilterChange = (key: string, selected: string[]) => {
    setMultiFilters((prev) => {
      const next = { ...prev };
      if (selected.length === 0) delete next[key];
      else next[key] = selected;
      return next;
    });
  };

  const fetchIssues = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);

    const res = await fetch(`/api/issues?${params}`);
    const data = await res.json();
    setIssues(data);
    setLoading(false);
  }, [search]);

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
    await fetch(`/api/issues/${id}`, { method: 'DELETE' });
    setSelectedId(null);
    fetchIssues();
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          type="text" placeholder="Search issues..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className={`${selectCls} flex-1 min-w-[200px]`}
        />
        <button onClick={() => setShowCreate(true)}
          className="px-3 py-1.5 bg-n-accent text-white rounded text-sm font-medium hover:bg-n-accent-hover">
          New
        </button>
      </div>
      <div className="mb-4">
        <FilterBar
          availableFilters={issueFilters}
          activeFilters={multiFilters}
          onChange={handleFilterChange}
        />
      </div>

      {loading ? (
        <div className="text-center py-8 text-n-text-dim">Loading issues...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-n-border-strong text-left">
                {([
                  ['priority', 'Priority', 'P0=Critical, P1=High, P2=Medium, P3=Low'],
                  ['title', 'Title', ''],
                  ['status', 'Status', 'backlog, triaged, in_progress, fixed, closed, wont_fix'],
                  ['component', 'Component', 'Module/area of the codebase'],
                  ['assignee', 'Assignee', 'Team member or Claude agent'],
                  ['created', 'Created', 'Date issue was created'],
                ] as const).map(([key, label, tip]) => (
                  <th key={key}
                    className="py-1.5 pr-4 text-n-text-secondary font-normal text-xs cursor-pointer select-none hover:text-n-text"
                    title={tip || undefined}
                    onClick={() => toggleSort(key as SortKey)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {label}
                      {sortKey === key ? (
                        <span className="text-n-accent text-[10px]">{sortDir === 'asc' ? '▲' : '▼'}</span>
                      ) : (
                        <span className="text-n-text-dim text-[10px] opacity-0 group-hover:opacity-100">⇅</span>
                      )}
                    </span>
                  </th>
                ))}
                <th className="py-1.5 text-n-text-secondary font-normal text-xs" title="Quick status change"></th>
              </tr>
            </thead>
            <tbody>
              {sortedIssues.map((issue) => (
                <tr key={issue.id} className="border-b border-n-border hover:bg-n-hover cursor-pointer group"
                  onClick={() => setSelectedId(issue.id)}>
                  <td className="py-2 pr-4"><PriorityBadge priority={issue.priority} /></td>
                  <td className="py-2 pr-4 text-n-text text-sm">{issue.title}</td>
                  <td className="py-2 pr-4"><StatusBadge status={issue.status} /></td>
                  <td className="py-2 pr-4 text-n-text-secondary text-sm">{issue.component || ''}</td>
                  <td className="py-2 pr-4 text-n-text-secondary text-sm">{issue.assignee || ''}</td>
                  <td className="py-2 pr-4 text-n-text-dim text-xs whitespace-nowrap">
                    {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="py-2">
                    <select
                      value={issue.status}
                      onChange={(e) => { e.stopPropagation(); handleStatusChange(issue.id, e.target.value); }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs px-1.5 py-0.5 border-none rounded bg-transparent text-n-text-dim opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
                    >
                      {ISSUE_STATUSES.map((s) => <option key={s} value={s}>{ISSUE_STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {issues.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-n-text-dim">No issues found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedId && (
        <IssueDetail
          issueId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdate={fetchIssues}
          onDelete={handleDelete}
        />
      )}

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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-n-surface rounded-xl p-6 w-full max-w-md shadow-xl border border-n-border max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-n-text mb-4">New Issue</h2>
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
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-n-border-strong text-n-text-secondary rounded-lg hover:bg-n-hover">Cancel</button>
            <button type="submit" disabled={!form.title.trim()} className="flex-1 px-4 py-2 bg-n-accent text-white rounded-lg hover:bg-n-accent-hover disabled:opacity-50 disabled:cursor-not-allowed">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
}
