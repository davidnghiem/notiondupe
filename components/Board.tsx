'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { AddTaskModal } from './AddTaskModal';
import { Column as ColumnType, Task } from '@/lib/schema';

type BoardColumn = ColumnType & { tasks: Task[] };

interface BoardData {
  columns: BoardColumn[];
  totalTasks: number;
}

export function Board() {
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedColumnId, setSelectedColumnId] = useState<number>(1);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const fetchBoard = useCallback(async () => {
    try {
      const response = await fetch('/api/board');
      if (!response.ok) throw new Error('Failed to fetch board');
      const data = await response.json();
      setBoardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const seedDatabase = async () => {
    try {
      await fetch('/api/seed', { method: 'POST' });
      await fetchBoard();
    } catch (err) {
      console.error('Failed to seed database:', err);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, [fetchBoard]);

  const handleAddTask = (columnId: number) => {
    setSelectedColumnId(columnId);
    setEditTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setSelectedColumnId(task.columnId || 1);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      await fetchBoard();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleSaveTask = async (taskData: {
    title: string;
    description: string;
    notes: string;
    columnId: number;
  }) => {
    try {
      if (editTask) {
        await fetch(`/api/tasks/${editTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
      } else {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
      }
      await fetchBoard();
    } catch (err) {
      console.error('Failed to save task:', err);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.id as number;

    for (const column of boardData?.columns || []) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) {
        setActiveTask(task);
        break;
      }
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !boardData) return;

    const activeId = active.id as number;
    const overId = over.id;

    // Find source column
    let sourceColumn: BoardColumn | undefined;
    let sourceIndex = -1;
    for (const column of boardData.columns) {
      const index = column.tasks.findIndex((t) => t.id === activeId);
      if (index !== -1) {
        sourceColumn = column;
        sourceIndex = index;
        break;
      }
    }

    if (!sourceColumn) return;

    // Determine target column
    let targetColumn: BoardColumn | undefined;
    let targetIndex = -1;

    if (typeof overId === 'string' && overId.startsWith('column-')) {
      const columnId = parseInt(overId.replace('column-', ''));
      targetColumn = boardData.columns.find((c) => c.id === columnId);
      targetIndex = targetColumn?.tasks.length || 0;
    } else {
      for (const column of boardData.columns) {
        const index = column.tasks.findIndex((t) => t.id === overId);
        if (index !== -1) {
          targetColumn = column;
          targetIndex = index;
          break;
        }
      }
    }

    if (!targetColumn) return;

    // If moving to a different column
    if (sourceColumn.id !== targetColumn.id) {
      const task = sourceColumn.tasks[sourceIndex];
      const newColumns = boardData.columns.map((col) => {
        if (col.id === sourceColumn!.id) {
          return {
            ...col,
            tasks: col.tasks.filter((t) => t.id !== activeId),
          };
        }
        if (col.id === targetColumn!.id) {
          const newTasks = [...col.tasks];
          newTasks.splice(targetIndex, 0, { ...task, columnId: col.id });
          return { ...col, tasks: newTasks };
        }
        return col;
      });

      setBoardData({ ...boardData, columns: newColumns });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !boardData) return;

    const activeId = active.id as number;
    const overId = over.id;

    // Find which column the task is now in
    let targetColumn: BoardColumn | undefined;
    let targetIndex = -1;

    for (const column of boardData.columns) {
      const index = column.tasks.findIndex((t) => t.id === activeId);
      if (index !== -1) {
        targetColumn = column;
        targetIndex = index;
        break;
      }
    }

    if (!targetColumn) return;

    // If dropping on another task in the same column, reorder
    if (typeof overId === 'number' && overId !== activeId) {
      const overIndex = targetColumn.tasks.findIndex((t) => t.id === overId);
      if (overIndex !== -1 && targetIndex !== overIndex) {
        const newTasks = arrayMove(targetColumn.tasks, targetIndex, overIndex);
        const newColumns = boardData.columns.map((col) =>
          col.id === targetColumn!.id ? { ...col, tasks: newTasks } : col
        );
        setBoardData({ ...boardData, columns: newColumns });

        // Update positions in database
        for (let i = 0; i < newTasks.length; i++) {
          await fetch(`/api/tasks/${newTasks[i].id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ position: i }),
          });
        }
      }
    }

    // Update the task's column in database
    const task = targetColumn.tasks.find((t) => t.id === activeId);
    if (task && task.columnId !== targetColumn.id) {
      await fetch(`/api/tasks/${activeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columnId: targetColumn.id,
          position: targetIndex,
        }),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading board...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-red-500">Error: {error}</div>
        <button
          onClick={seedDatabase}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Initialize Database
        </button>
      </div>
    );
  }

  if (!boardData || boardData.columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-gray-500">No columns found. Initialize the database?</div>
        <button
          onClick={seedDatabase}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Create Default Columns
        </button>
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-4">
          {boardData.columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-3">
              <TaskCard
                task={activeTask}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        columnId={selectedColumnId}
        editTask={editTask}
      />
    </>
  );
}
