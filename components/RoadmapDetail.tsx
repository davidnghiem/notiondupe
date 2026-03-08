'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { StatusBadge } from './StatusBadge';
import { FileUpload } from './FileUpload';
import { ROADMAP_PHASES, ROADMAP_PHASE_LABELS, ROADMAP_STATUSES, ROADMAP_STATUS_LABELS, TEAM_MEMBERS } from '@/lib/constants';

interface Attachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

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
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

interface RoadmapDetailProps {
  itemId: number;
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

function InlineDate({ value, onSave, placeholder }: {
  value: string | null;
  onSave: (v: string | null) => void;
  placeholder: string;
}) {
  const [editing, setEditing] = useState(false);
  const formatted = value ? new Date(value).toLocaleDateString() : null;

  if (!editing) {
    return (
      <div onClick={() => setEditing(true)} className="cursor-pointer rounded px-1.5 py-1 -mx-1.5 hover:bg-n-hover transition-colors">
        <span className="text-sm text-n-text">{formatted || <span className="text-n-text-dim">{placeholder}</span>}</span>
      </div>
    );
  }

  const dateVal = value ? new Date(value).toISOString().split('T')[0] : '';

  return (
    <input
      type="date"
      value={dateVal}
      onChange={(e) => { onSave(e.target.value || null); setEditing(false); }}
      onBlur={() => setEditing(false)}
      autoFocus
      className="px-2 py-1.5 text-sm border border-n-accent rounded-lg bg-n-elevated text-n-text outline-none"
    />
  );
}

export function RoadmapDetail({ itemId, onClose, onUpdate, onDelete }: RoadmapDetailProps) {
  const [item, setItem] = useState<RoadmapItemData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchItem = useCallback(async () => {
    const res = await fetch(`/api/roadmap/${itemId}`);
    const data = await res.json();
    setItem(data);
    setLoading(false);
  }, [itemId]);

  useEffect(() => { fetchItem(); }, [fetchItem]);

  const patchField = async (field: string, value: unknown) => {
    await fetch(`/api/roadmap/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: value }),
    });
    fetchItem();
    onUpdate();
  };

  const toggleAssignee = (member: string) => {
    if (!item) return;
    const newAssignees = item.assignees.includes(member)
      ? item.assignees.filter((a) => a !== member)
      : [...item.assignees, member];
    patchField('assignees', newAssignees);
  };

  if (loading || !item) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-end justify-end z-50">
        <div className="bg-n-surface w-full max-w-2xl h-full border-l border-n-border p-6">
          <div className="text-n-text-dim">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-stretch justify-end z-50" onClick={onClose}>
      <div
        className="bg-n-bg w-full max-w-2xl h-full border-l border-n-border overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-n-bg border-b border-n-border px-6 py-3 flex items-center justify-between z-10">
          <span className="text-xs text-n-text-dim">ROADMAP-{item.id}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (confirm('Delete this roadmap item?')) { onDelete(item.id); onClose(); } }}
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
            value={item.title}
            onSave={(v) => patchField('title', v)}
            placeholder="Roadmap item title"
            className="text-xl font-semibold text-n-text"
          />

          {/* Properties */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-4 py-1">
              <span className="text-xs text-n-text-dim w-28 flex-shrink-0">Phase</span>
              <div className="flex-1">
                <InlineSelect
                  value={item.phase}
                  options={ROADMAP_PHASES.map((p) => ({ value: p, label: ROADMAP_PHASE_LABELS[p] }))}
                  onSave={(v) => patchField('phase', v)}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 py-1">
              <span className="text-xs text-n-text-dim w-28 flex-shrink-0">Status</span>
              <div className="flex-1">
                <InlineSelect
                  value={item.status}
                  options={ROADMAP_STATUSES.map((s) => ({ value: s, label: ROADMAP_STATUS_LABELS[s] }))}
                  onSave={(v) => patchField('status', v)}
                  renderValue={(v) => <StatusBadge status={v} />}
                />
              </div>
            </div>
            <div className="flex items-center gap-4 py-1">
              <span className="text-xs text-n-text-dim w-28 flex-shrink-0">Start Date</span>
              <div className="flex-1">
                <InlineDate value={item.startDate} onSave={(v) => patchField('startDate', v)} placeholder="Set start date" />
              </div>
            </div>
            <div className="flex items-center gap-4 py-1">
              <span className="text-xs text-n-text-dim w-28 flex-shrink-0">Target Date</span>
              <div className="flex-1">
                <InlineDate value={item.targetDate} onSave={(v) => patchField('targetDate', v)} placeholder="Set target date" />
              </div>
            </div>
            <div className="flex items-center gap-4 py-1">
              <span className="text-xs text-n-text-dim w-28 flex-shrink-0">Dependencies</span>
              <div className="flex-1">
                <InlineText
                  value={item.dependencies.length > 0 ? item.dependencies.map((d) => `#${d}`).join(', ') : ''}
                  onSave={(v) => {
                    const ids = v.split(',').map((s) => parseInt(s.replace('#', '').trim())).filter((n) => !isNaN(n));
                    patchField('dependencies', ids);
                  }}
                  placeholder="e.g. #3, #7"
                />
              </div>
            </div>
          </div>

          {/* Assignees */}
          <div>
            <h3 className="text-xs font-semibold text-n-text-dim uppercase tracking-wider mb-2">Assignees</h3>
            <div className="flex flex-wrap gap-1.5">
              {TEAM_MEMBERS.map((m) => (
                <button
                  key={m}
                  onClick={() => toggleAssignee(m)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    item.assignees.includes(m)
                      ? 'bg-n-accent text-white'
                      : 'bg-n-elevated text-n-text-secondary hover:bg-n-hover'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-n-border" />

          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-n-text-dim uppercase tracking-wider mb-2">Description</h3>
            <InlineText
              value={item.description || ''}
              onSave={(v) => patchField('description', v || null)}
              placeholder="Add a description..."
              multiline
              className="text-sm text-n-text-secondary"
            />
          </div>

          {/* Attachments */}
          <div>
            <h3 className="text-xs font-semibold text-n-text-dim uppercase tracking-wider mb-2">Attachments</h3>
            <FileUpload
              attachments={item.attachments}
              onChange={(atts) => patchField('attachments', atts)}
            />
          </div>

          {/* Metadata */}
          <div className="border-t border-n-border pt-4 text-xs text-n-text-dim space-y-1">
            <div>Created: {new Date(item.createdAt).toLocaleString()}</div>
            <div>Updated: {new Date(item.updatedAt).toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
