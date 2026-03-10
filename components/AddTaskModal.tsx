'use client';

import { useState, useEffect } from 'react';
import { Task } from '@/lib/schema';
import { PRIORITIES, COMPONENTS, TEAM_MEMBERS } from '@/lib/constants';

interface ColumnOption {
  id: number;
  name: string;
}

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: {
    title: string;
    description: string;
    notes: string;
    columnId: number;
    priority: string | null;
    labels: string[];
    assignee: string | null;
    dueDate: string | null;
  }) => void;
  columnId: number;
  editTask?: Task | null;
  columns?: ColumnOption[];
}

const inputCls = "w-full px-3 py-2 border border-n-border-strong rounded bg-n-elevated text-n-text focus:ring-1 focus:ring-n-accent outline-none placeholder:text-n-text-dim text-sm";

export function AddTaskModal({ isOpen, onClose, onSave, columnId, editTask, columns = [] }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<string>('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [assignee, setAssignee] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [selectedColumnId, setSelectedColumnId] = useState<number>(columnId);

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || '');
      setNotes(editTask.notes || '');
      setPriority(editTask.priority || '');
      const labels = editTask.labels
        ? (typeof editTask.labels === 'string' ? JSON.parse(editTask.labels) : editTask.labels)
        : [];
      setSelectedLabels(labels);
      setAssignee(editTask.assignee || '');
      setDueDate(editTask.dueDate ? new Date(editTask.dueDate).toISOString().split('T')[0] : '');
      setSelectedColumnId(editTask.columnId || columnId);
    } else {
      setTitle('');
      setDescription('');
      setNotes('');
      setPriority('');
      setSelectedLabels([]);
      setAssignee('');
      setDueDate('');
      setSelectedColumnId(columnId);
    }
  }, [editTask, isOpen, columnId]);

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      notes: notes.trim(),
      columnId: selectedColumnId,
      priority: priority || null,
      labels: selectedLabels,
      assignee: assignee || null,
      dueDate: dueDate || null,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-n-surface rounded-xl p-6 w-full max-w-md shadow-xl border border-n-border max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold text-n-text mb-4">
          {editTask ? 'Edit Task' : 'Add New Task'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className={inputCls} placeholder="Task title *" autoFocus />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
            className={`${inputCls} resize-none`} placeholder="Description" />
          <div className="grid grid-cols-2 gap-3">
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputCls}>
              <option value="">Priority</option>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={inputCls}>
              <option value="">Assignee</option>
              {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {columns.length > 0 && (
            <div>
              <label className="block text-xs text-n-text-dim mb-1">Status</label>
              <select value={selectedColumnId} onChange={(e) => setSelectedColumnId(parseInt(e.target.value))} className={inputCls}>
                {columns.map((col) => <option key={col.id} value={col.id}>{col.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="block text-xs text-n-text-dim mb-1">Due Date</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-n-text-secondary mb-1">Labels</label>
            <div className="flex flex-wrap gap-1.5">
              {COMPONENTS.map((label) => (
                <button key={label} type="button" onClick={() => toggleLabel(label)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                    selectedLabels.includes(label)
                      ? 'bg-n-accent text-white'
                      : 'bg-n-elevated text-n-text-secondary hover:bg-n-hover'
                  }`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
            className={`${inputCls} resize-none`} placeholder="Notes" />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-n-border-strong text-n-text-secondary rounded-lg hover:bg-n-hover">
              Cancel
            </button>
            <button type="submit" disabled={!title.trim()}
              className="flex-1 px-4 py-2 bg-n-accent text-white rounded-lg hover:bg-n-accent-hover disabled:opacity-50 disabled:cursor-not-allowed">
              {editTask ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
