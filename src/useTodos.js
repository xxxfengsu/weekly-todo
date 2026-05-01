import { useState, useCallback } from 'react';
import { uid } from './utils';

const STORAGE_KEY = 'weekly-todo-v1';

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useTodos(weekId) {
  const [all, setAll] = useState(load);

  const weekData = all[weekId] ?? { 0: [], 1: [], 2: [], 3: [], 4: [] };

  const update = useCallback((updater) => {
    setAll(prev => {
      const next = { ...prev };
      const week = { 0: [], 1: [], 2: [], 3: [], 4: [], ...next[weekId] };
      updater(week);
      next[weekId] = week;
      save(next);
      return next;
    });
  }, [weekId]);

  const addTask = useCallback((dayIdx, text) => {
    update(week => {
      week[dayIdx] = [...(week[dayIdx] || []), { id: uid(), text, done: false }];
    });
  }, [update]);

  const toggleTask = useCallback((dayIdx, taskId) => {
    update(week => {
      week[dayIdx] = (week[dayIdx] || []).map(t =>
        t.id === taskId ? { ...t, done: !t.done } : t
      );
    });
  }, [update]);

  const deleteTask = useCallback((dayIdx, taskId) => {
    update(week => {
      week[dayIdx] = (week[dayIdx] || []).filter(t => t.id !== taskId);
    });
  }, [update]);

  const clearWeek = useCallback(() => {
    update(week => {
      for (let i = 0; i < 5; i++) week[i] = [];
    });
  }, [update]);

  return { weekData, addTask, toggleTask, deleteTask, clearWeek };
}
