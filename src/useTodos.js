import { useState, useCallback, useEffect, useRef } from 'react';
import { uid } from './utils';
import { supabase } from './supabase';

const EMPTY_WEEK = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };

function buildWeekData(rowMap) {
  const week = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [] };
  const rows = Object.values(rowMap).sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
  for (const row of rows) {
    const d = row.day_idx;
    if (week[d] !== undefined) {
      week[d] = [...week[d], { id: row.id, text: row.text, note: row.note, done: row.done }];
    }
  }
  return week;
}

export function useTodos(roomId) {
  const [weekData, setWeekData] = useState(EMPTY_WEEK);
  const [loading, setLoading] = useState(true);
  const rowsRef = useRef({});

  function applyRows() {
    setWeekData(buildWeekData(rowsRef.current));
  }

  // Load initial tasks
  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    rowsRef.current = {};
    supabase
      .from('tasks')
      .select('*')
      .eq('room_id', roomId)
      .then(({ data, error }) => {
        if (error) console.error('Load error:', error);
        for (const row of (data ?? [])) rowsRef.current[row.id] = row;
        applyRows();
        setLoading(false);
      });
  }, [roomId]);

  // Real-time: each task row is independent → no conflict between users
  useEffect(() => {
    if (!roomId) return;
    const channel = supabase
      .channel(`tasks-${roomId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks', filter: `room_id=eq.${roomId}` }, payload => {
        rowsRef.current[payload.new.id] = payload.new;
        applyRows();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks', filter: `room_id=eq.${roomId}` }, payload => {
        rowsRef.current[payload.new.id] = payload.new;
        applyRows();
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks', filter: `room_id=eq.${roomId}` }, payload => {
        delete rowsRef.current[payload.old.id];
        applyRows();
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [roomId]);

  const addTask = useCallback((dayIdx, text, note = '') => {
    const lower = text.trim().toLowerCase();
    const duplicate = Object.values(rowsRef.current).some(r => r.text.trim().toLowerCase() === lower);
    if (duplicate) return false;

    const id = uid();
    const now = new Date().toISOString();
    const row = { id, room_id: roomId, day_idx: dayIdx, text, note, done: false, created_at: now, updated_at: now };
    rowsRef.current[id] = row;
    applyRows();
    supabase.from('tasks').insert(row).then(({ error }) => {
      if (error) { console.error('Insert error:', error); delete rowsRef.current[id]; applyRows(); }
    });
    return true;
  }, [roomId]);

  const toggleTask = useCallback((dayIdx, taskId) => {
    const row = rowsRef.current[taskId];
    if (!row) return;
    const updated = { ...row, done: !row.done, updated_at: new Date().toISOString() };
    rowsRef.current[taskId] = updated;
    applyRows();
    supabase.from('tasks').update({ done: updated.done, updated_at: updated.updated_at }).eq('id', taskId)
      .then(({ error }) => { if (error) { rowsRef.current[taskId] = row; applyRows(); } });
  }, []);

  const deleteTask = useCallback((dayIdx, taskId) => {
    const row = rowsRef.current[taskId];
    delete rowsRef.current[taskId];
    applyRows();
    supabase.from('tasks').delete().eq('id', taskId)
      .then(({ error }) => { if (error && row) { rowsRef.current[taskId] = row; applyRows(); } });
  }, []);

  const editTask = useCallback((dayIdx, taskId, text, note) => {
    const row = rowsRef.current[taskId];
    if (!row) return;
    const updated = { ...row, text, note, updated_at: new Date().toISOString() };
    rowsRef.current[taskId] = updated;
    applyRows();
    supabase.from('tasks').update({ text, note, updated_at: updated.updated_at }).eq('id', taskId)
      .then(({ error }) => { if (error) { rowsRef.current[taskId] = row; applyRows(); } });
  }, []);

  const moveTask = useCallback((fromDay, toDay, taskId) => {
    const row = rowsRef.current[taskId];
    if (!row) return;
    const updated = { ...row, day_idx: toDay, updated_at: new Date().toISOString() };
    rowsRef.current[taskId] = updated;
    applyRows();
    supabase.from('tasks').update({ day_idx: toDay, updated_at: updated.updated_at }).eq('id', taskId)
      .then(({ error }) => { if (error) { rowsRef.current[taskId] = row; applyRows(); } });
  }, []);

  const clearAll = useCallback(() => {
    rowsRef.current = {};
    setWeekData(EMPTY_WEEK);
    supabase.from('tasks').delete().eq('room_id', roomId)
      .then(({ error }) => { if (error) console.error('Clear error:', error); });
  }, [roomId]);

  return { weekData, loading, addTask, toggleTask, deleteTask, editTask, moveTask, clearAll };
}
