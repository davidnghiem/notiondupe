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
      className="px-3 py-1.5 text-sm border border-n-border-strong rounded-lg bg-n-surface text-n-text focus:ring-1 focus:ring-n-accent outline-none"
    >
      {boardList.map((board) => (
        <option key={board.id} value={board.id}>
          {board.name}
        </option>
      ))}
    </select>
  );
}
