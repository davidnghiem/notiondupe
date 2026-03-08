'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';
import { FileUpload } from './FileUpload';
import { PRIORITIES, ISSUE_STATUSES, ISSUE_STATUS_LABELS, COMPONENTS, TEAM_MEMBERS } from '@/lib/constants';

interface Attachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

interface IssueData {
  id: number;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  component: string | null;
  assignee: string | null;
  reporter: string | null;
  versionFound: string | null;
  versionFixed: string | null;
  stepsToReproduce: string | null;
  attachments: Attachment[];
  customFields: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

interface IssueDetailProps {
  issueId: number;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: (id: number) => void;
}

const selectCls = "px-2 py-1.5 text-sm border border-n-border-strong rounded-lg bg-n-elevated text-n-text outline-none focus:border-n-accent";

function InlineText({ value, onSave, placeholder, multiline, className }: {
  value: string;
  onSave: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) ref.current?.focus(); }, [editing]);

  const save = () => {
    setEditing(false);
    if (draft.trim() !== value) onSave(draft.trim());
  };

  if (!editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        className={`cursor-pointer rounded px-1.5 py-1 -mx-1.5 hover:bg-n-hover transition-colors min-h-[28px] ${className || ''}`}
      >
        {value || <span className="text-n-text-dim">{placeholder || 'Empty'}</span>}
      </div>
    );
  }

  if (multiline) {
    return (
      <textarea
        ref={ref as React.RefObject<HTMLTextAreaElement>}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => { if (e.key === 'Escape') { setDraft(value); setEditing(false); } }}
        rows={4}
        placeholder={placeholder}
        className={`w-full px-2 py-1.5 text-sm border border-n-accent rounded-lg bg-n-elevated text-n-text outline-none resize-none ${className || ''}`}
      />
    );
  }

  return (
    <input
      ref={ref as React.RefObject<HTMLInputElement>}
      type="text"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') { setDraft(value); setEditing(false); }
      }}
      placeholder={placeholder}
      className={`w-full px-2 py-1.5 text-sm border border-n-accent rounded-lg bg-n-elevated text-n-text outline-none ${className || ''}`}
    />
  );
}

function InlineSelect({ value, options, onSave, renderValue }: {
  value: string;
  options: { value: string; label: string }[];
  onSave: (v: string) => void;
  renderValue?: (v: string) => React.ReactNode;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div onClick={() => setEditing(true)} className="cursor-pointer rounded px-1.5 py-1 -mx-1.5 hover:bg-n-hover transition-colors">
        {renderValue ? renderValue(value) : <span className="text-sm text-n-text">{options.find((o) => o.value === value)?.label || value}</span>}
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => { onSave(e.target.value); setEditing(false); }}
      onBlur={() => setEditing(false)}
      autoFocus
      className={selectCls}
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export function IssueDetail({ issueId, onClose, onUpdate, onDelete }: IssueDetailProps) {
  const [issue, setIssue] = useState<IssueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSteps, setShowSteps] = useState(false);
  const [newFieldName, setNewFieldName] = useState('');
  const [addingField, setAddingField] = useState(false);

  const fetchIssue = useCallback(async () => {
    const res = await fetch(`/api/issues/${issueId}`);
    const data = await res.json();
    setIssue(data);
    setLoading(false);
  }, [issueId]);

  useEffect(() => { fetchIssue(); }, [fetchIssue]);

  const patchField = async (field: string, value: unknown) => {
    await fetch(`/api/issues/${issueId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    fetchIssue();
    onUpdate();
  };

  const updateCustomField = async (key: string, value: string) => {
    if (!issue) return;
    const updated = { ...issue.customFields, [key]: value };
    await patchField('customFields', updated);
  };

  const deleteCustomField = async (key: string) => {
    if (!issue) return;
    const updated = { ...issue.customFields };
    delete updated[key];
    await patchField('customFields', updated);
  };

  const addCustomField = async () => {
    if (!newFieldName.trim() || !issue) return;
    const updated = { ...issue.customFields, [newFieldName.trim()]: '' };
    await patchField('customFields', updated);
    setNewFieldName('');
    setAddingField(false);
  };

  if (loading || !issue) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-end justify-end z-50">
        <div className="bg-n-surface w-full max-w-2xl h-full border-l border-n-border p-6">
          <div className="text-n-text-dim">Loading...</div>
        </div>
      </div>
    );
  }

  const propertyRows: { label: string; content: React.ReactNode }[] = [
    {
      label: 'Priority',
      content: (
        <InlineSelect
          value={issue.priority}
          options={PRIORITIES.map((p) => ({ value: p, label: p }))}
          onSave={(v) => patchField('priority', v)}
          renderValue={(v) => <PriorityBadge priority={v} />}
        />
      ),
    },
    {
      label: 'Status',
      content: (
        <InlineSelect
          value={issue.status}
          options={ISSUE_STATUSES.map((s) => ({ value: s, label: ISSUE_STATUS_LABELS[s] }))}
          onSave={(v) => patchField('status', v)}
          renderValue={(v) => <StatusBadge status={v} />}
        />
      ),
    },
    {
      label: 'Component',
      content: (
        <InlineSelect
          value={issue.component || ''}
          options={[{ value: '', label: 'None' }, ...COMPONENTS.map((c) => ({ value: c, label: c }))]}
          onSave={(v) => patchField('component', v || null)}
          renderValue={(v) => <span className="text-sm text-n-text">{v || <span className="text-n-text-dim">None</span>}</span>}
        />
      ),
    },
    {
      label: 'Assignee',
      content: (
        <InlineSelect
          value={issue.assignee || ''}
          options={[{ value: '', label: 'Unassigned' }, ...TEAM_MEMBERS.map((m) => ({ value: m, label: m }))]}
          onSave={(v) => patchField('assignee', v || null)}
          renderValue={(v) => <span className="text-sm text-n-text">{v || <span className="text-n-text-dim">Unassigned</span>}</span>}
        />
      ),
    },
    {
      label: 'Reporter',
      content: (
        <InlineSelect
          value={issue.reporter || ''}
          options={[{ value: '', label: 'None' }, ...TEAM_MEMBERS.map((m) => ({ value: m, label: m }))]}
          onSave={(v) => patchField('reporter', v || null)}
          renderValue={(v) => <span className="text-sm text-n-text">{v || <span className="text-n-text-dim">None</span>}</span>}
        />
      ),
    },
    {
      label: 'Version Found',
      content: (
        <InlineText
          value={issue.versionFound || ''}
          onSave={(v) => patchField('versionFound', v || null)}
          placeholder="e.g. v67.4"
        />
      ),
    },
    {
      label: 'Version Fixed',
      content: (
        <InlineText
          value={issue.versionFixed || ''}
          onSave={(v) => patchField('versionFixed', v || null)}
          placeholder="e.g. v67.5"
        />
      ),
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-stretch justify-end z-50" onClick={onClose}>
      <div
        className="bg-n-bg w-full max-w-2xl h-full border-l border-n-border overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-n-bg border-b border-n-border px-6 py-3 flex items-center justify-between z-10">
          <span className="text-xs text-n-text-dim">ISSUE-{issue.id}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (confirm('Delete this issue?')) { onDelete(issue.id); onClose(); } }}
              className="px-2 py-1 text-xs text-n-danger hover:bg-n-danger/10 rounded"
            >
              Delete
            </button>
            <button onClick={onClose} className="p-1 text-n-text-dim hover:text-n-text rounded hover:bg-n-hover">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Title */}
          <InlineText
            value={issue.title}
            onSave={(v) => patchField('title', v)}
            placeholder="Issue title"
            className="text-xl font-semibold text-n-text"
          />

          {/* Properties */}
          <div className="space-y-0.5">
            {propertyRows.map((row) => (
              <div key={row.label} className="flex items-center gap-4 py-1">
                <span className="text-xs text-n-text-dim w-28 flex-shrink-0">{row.label}</span>
                <div className="flex-1">{row.content}</div>
              </div>
            ))}

            {/* Custom Fields */}
            {Object.entries(issue.customFields).map(([key, val]) => (
              <div key={key} className="flex items-center gap-4 py-1 group">
                <span className="text-xs text-n-text-dim w-28 flex-shrink-0 truncate" title={key}>{key}</span>
                <div className="flex-1">
                  <InlineText
                    value={val}
                    onSave={(v) => updateCustomField(key, v)}
                    placeholder="Value"
                  />
                </div>
                <button
                  onClick={() => deleteCustomField(key)}
                  className="p-1 text-n-text-dim hover:text-n-danger opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  title="Remove property"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Add Property */}
            {addingField ? (
              <div className="flex items-center gap-2 py-1">
                <input
                  type="text"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addCustomField();
                    if (e.key === 'Escape') { setAddingField(false); setNewFieldName(''); }
                  }}
                  placeholder="Property name"
                  className="px-2 py-1 text-sm border border-n-accent rounded bg-n-elevated text-n-text outline-none w-40"
                  autoFocus
                />
                <button onClick={addCustomField} className="text-xs text-n-accent hover:text-n-accent-hover">Add</button>
                <button onClick={() => { setAddingField(false); setNewFieldName(''); }} className="text-xs text-n-text-dim hover:text-n-text">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setAddingField(true)}
                className="text-xs text-n-text-dim hover:text-n-accent py-1 flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add a property
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-n-border" />

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-n-text-dim uppercase tracking-wider mb-2">Description</h3>
            <InlineText
              value={issue.description || ''}
              onSave={(v) => patchField('description', v || null)}
              placeholder="Add a description..."
              multiline
              className="text-sm text-n-text-secondary"
            />
          </div>

          {/* Steps to Reproduce */}
          <div>
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="text-xs font-semibold text-n-text-dim uppercase tracking-wider mb-2 flex items-center gap-1 hover:text-n-text"
            >
              <svg className={`w-3 h-3 transition-transform ${showSteps ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Steps to Reproduce
            </button>
            {showSteps && (
              <InlineText
                value={issue.stepsToReproduce || ''}
                onSave={(v) => patchField('stepsToReproduce', v || null)}
                placeholder="Add steps to reproduce..."
                multiline
                className="text-sm text-n-text-secondary"
              />
            )}
          </div>

          {/* Attachments */}
          <div>
            <h3 className="text-xs font-semibold text-n-text-dim uppercase tracking-wider mb-2">Attachments</h3>
            <FileUpload
              attachments={issue.attachments}
              onChange={(atts) => patchField('attachments', atts)}
            />
          </div>

          {/* Metadata */}
          <div className="border-t border-n-border pt-4 text-xs text-n-text-dim space-y-1">
            <div>Created: {new Date(issue.createdAt).toLocaleString()}</div>
            <div>Updated: {new Date(issue.updatedAt).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
