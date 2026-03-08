'use client';

import { useState, useEffect } from 'react';
import { Board } from '@/lib/schema';

interface BoardSelectorProps {
  currentBoardId: number;
  onBoardChange: (boardId: number) => void;
}

export function BoardSelector({ currentBoardId, onBoardChange }: BoardSelectorProps) {
  const [boardList, setBoardList] = useState<Board[]>([]);

  useEffect(() => {
    fetch('/api/boards')
      .then((res) => res.json())
      .then((data) => setBoardList(data))
      .catch(console.error);
  }, []);

  if (boardList.length <= 1) return null;

  return (
    <select
      value={currentBoardId}
      onChange={(e) => onBoardChange(parseInt(e.target.value))}
      className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 outline-none"
    >
      {boardList.map((board) => (
        <option key={board.id} value={board.id}>
          {board.name}
        </option>
      ))}
    </select>
  );
}
