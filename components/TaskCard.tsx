'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/schema';
import { PriorityBadge } from './PriorityBadge';
import { LabelPill } from './LabelPill';
import { StatusBadge } from './StatusBadge';
import { getActorColor } from '@/lib/constants';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: number) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const parsedLabels: string[] = Array.isArray(task.labels)
    ? task.labels
    : task.labels
      ? JSON.parse(task.labels as string)
      : [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-n-surface p-3 rounded-xl border border-n-border cursor-grab active:cursor-grabbing hover:bg-n-hover group ${
        isDragging ? 'opacity-50' : ''
      }`}
      style={{ boxShadow: isDragging ? 'var(--n-deep-shadow)' : 'var(--n-card-shadow)' }}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-medium text-n-text text-sm leading-snug flex-1 min-w-0">
          <span className="text-n-text-dim font-normal">#{task.id}</span>{' '}
          {task.title}
        </h3>
        <div className="flex gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            className="p-1 text-n-text-dim hover:text-n-text hover:bg-n-elevated rounded"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            className="p-1 text-n-text-dim hover:text-n-danger hover:bg-n-elevated rounded"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-xs text-n-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {task.assignee && (
        <div className="flex items-center gap-1.5 mt-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${getActorColor(task.assignee)}20` }}>
            <span className="text-[10px] font-semibold" style={{ color: getActorColor(task.assignee) }}>{task.assignee.charAt(0)}</span>
          </div>
          <span className="text-xs font-medium" style={{ color: getActorColor(task.assignee) }}>{task.assignee}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <PriorityBadge priority={task.priority} />
        {parsedLabels.map((label) => (
          <LabelPill key={label} label={label} />
        ))}
        {task.dueDate && (
          <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
            isOverdue
              ? 'bg-[rgba(235,87,87,0.15)] text-[rgba(235,87,87,1)]'
              : 'bg-n-elevated text-n-text-dim'
          }`}>
            {new Date(task.dueDate).toLocaleDateString()}
          </span>
        )}
        {task.createdAt && (
          <span className="text-[11px] text-n-text-dim ml-auto" title="Created">
            {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  );
}
