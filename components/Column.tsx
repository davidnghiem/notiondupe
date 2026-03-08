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

export function Column({ column, onAddTask, onEditTask, onDeleteTask }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { columnId: column.id },
  });

  const taskIds = column.tasks.map((task) => task.id);

  return (
    <div
      className={`bg-gray-100 dark:bg-gray-900 rounded-xl p-4 min-w-[300px] max-w-[300px] flex flex-col max-h-[calc(100vh-150px)] ${
        isOver ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-700 dark:text-gray-300">
          {column.name}
          <span className="ml-2 text-sm text-gray-500">({column.tasks.length})</span>
        </h2>
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
          title="Add task"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto space-y-3 min-h-[100px]"
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
          <div className="text-center text-gray-400 dark:text-gray-600 py-8 text-sm">
            No tasks yet
          </div>
        )}
      </div>
    </div>
  );
}
