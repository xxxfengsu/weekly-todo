import { useState, useCallback, useEffect } from 'react';
import { uid } from './utils';
import { supabase } from './supabase';

const EMPTY_WEEK = { 0: [], 1: [], 2: [], 3: [], 4: [] };

export function useTodos(roomId, weekId) {
  const [weekData, setWeekData] = useState(EMPTY_WEEK);
  const [loading, setLoading] = useState(true);

  // Load initial data from Supabase
  useEffect(() => {
    if (!roomId || !weekId) return;
    setLoading(true);
    supabase
      .from('todos')
      .select('data')
      .eq('room_id', roomId)
      .eq('week_id', weekId)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.data) setWeekData(data.data);
        setLoading(false);
      });
  }, [roomId, weekId]);

  // Real-time subscription
  useEffect(() => {
    if (!roomId || !weekId) return;
    const channel = supabase
      .channel(`room-${roomId}-${weekId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'todos',
        filter: `room_id=eq.${roomId}`,
      }, payload => {
        if (payload.new?.week_id === weekId) {
          setWeekData(payload.new.data ?? EMPTY_WEEK);
        }
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [roomId, weekId]);

  const save = useCallback((data) => {
    supabase.from('todos').upsert(
      { room_id: roomId, week_id: weekId, data, updated_at: new Date().toISOString() },
      { onConflict: 'room_id,week_id' }
    );
  }, [roomId, weekId]);

  const update = useCallback((updater) => {
    setWeekData(prev => {
      const next = { ...EMPTY_WEEK, ...prev };
      updater(next);
      save(next);
      return next;
    });
  }, [save]);

  const addTask = useCallback((dayIdx, text, note = '') => {
    update(w => { w[dayIdx] = [...(w[dayIdx] || []), { id: uid(), text, note, done: false }]; });
  }, [update]);

  const toggleTask = useCallback((dayIdx, taskId) => {
    update(w => { w[dayIdx] = (w[dayIdx] || []).map(t => t.id === taskId ? { ...t, done: !t.done } : t); });
  }, [update]);

  const deleteTask = useCallback((dayIdx, taskId) => {
    update(w => { w[dayIdx] = (w[dayIdx] || []).filter(t => t.id !== taskId); });
  }, [update]);

  const editTask = useCallback((dayIdx, taskId, text, note) => {
    update(w => { w[dayIdx] = (w[dayIdx] || []).map(t => t.id === taskId ? { ...t, text, note } : t); });
  }, [update]);

  const clearWeek = useCallback(() => {
    update(w => { for (let i = 0; i < 5; i++) w[i] = []; });
  }, [update]);

  return { weekData, loading, addTask, toggleTask, deleteTask, editTask, clearWeek };
}
