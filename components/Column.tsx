'use client';

import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TaskCard } from './TaskCard';
import { Column as ColumnType, Task } from '@/lib/schema';

interface ColumnProps {
  column: ColumnType & { tasks: Task[] };
  onAddTask: (columnId: number) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
}

// Notion-style column header dot colors based on column name
const COLUMN_DOT_COLORS: Record<string, string> = {
  'Backlog': 'rgba(155,155,155,1)',
  'To Do': 'rgba(73,144,226,1)',
  'In Progress': 'rgba(203,145,47,1)',
  'In Review': 'rgba(167,130,195,1)',
  'Done': 'rgba(77,171,154,1)',
  'Blocked': 'rgba(235,87,87,1)',
};

function getColumnDotColor(name: string): string {
  return COLUMN_DOT_COLORS[name] || 'rgba(155,155,155,1)';
}

export function Column({ column, onAddTask, onEditTask, onDeleteTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { columnId: column.id },
  });

  const taskIds = column.tasks.map((task) => task.id);
  const dotColor = getColumnDotColor(column.name);

  return (
    <div
      className={`min-w-[280px] max-w-[280px] flex flex-col max-h-[calc(100vh-150px)] ${
        isOver ? 'ring-1 ring-n-accent rounded-lg' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
          <h2 className="font-medium text-n-text text-sm">
            {column.name}
          </h2>
          <span className="text-n-text-dim text-sm">{column.tasks.length}</span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1 text-n-text-dim hover:text-n-text hover:bg-n-hover rounded"
          title="Add task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto bg-n-elevated rounded-lg p-1.5 space-y-1.5 min-h-[100px]"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {column.tasks.length === 0 && (
          <div className="text-center text-n-text-dim py-8 text-sm">
            No tasks yet
          </div>
        )}

        <button
          onClick={() => onAddTask(column.id)}
          className="px-2 py-1.5 text-sm text-n-text-dim hover:text-n-text-secondary hover:bg-n-hover rounded flex items-center gap-1.5 w-full"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New task
        </button>
      </div>
    </div>
  );
}
