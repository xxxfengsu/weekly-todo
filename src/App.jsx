import { useMemo, useState } from 'react';
import {
  DndContext, DragOverlay, pointerWithin,
  PointerSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import DayCard from './DayCard';
import TaskModal from './TaskModal';
import { getWeekDates } from './utils';
import { useTodos } from './useTodos';
import styles from './App.module.css';

function getRoomId() {
  const params = new URLSearchParams(window.location.search);
  let room = params.get('room');
  if (!room) {
    room = Math.random().toString(36).slice(2, 8);
    params.set('room', room);
    window.history.replaceState({}, '', `?${params}`);
  }
  return room;
}

export default function App() {
  const dates = useMemo(() => getWeekDates(), []);
  const roomId = useMemo(() => getRoomId(), []);
  const { weekData, loading, addTask, toggleTask, deleteTask, editTask, moveTask, clearAll } = useTodos(roomId);
  const [confirming, setConfirming] = useState(false);
  const [modal, setModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [activeDrag, setActiveDrag] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  function handleDragStart({ active }) {
    setActiveDrag(active.data.current);
  }

  function handleDragEnd({ active, over }) {
    setActiveDrag(null);
    if (!over) return;
    const { taskId, fromDay } = active.data.current;
    const toDay = Number(over.id);
    if (fromDay !== toDay) moveTask(fromDay, toDay, taskId);
  }

  function handleClear() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    clearAll();
    setConfirming(false);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const weekColumns = dates.map((date, idx) => ({ dayIdx: idx, date }));

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Weekly Planner</h1>
        <div className={styles.actions}>
          <button className={styles.shareBtn} onClick={handleCopyLink}>
            {copied ? '✓ Copied!' : 'Share Link'}
          </button>
          <button
            className={`${styles.clearBtn} ${confirming ? styles.confirm : ''}`}
            onClick={handleClear}
          >
            {confirming ? 'Confirm Clear' : 'Clear This Week'}
          </button>
        </div>
      </header>

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <main className={styles.board}>
            {weekColumns.map(({ dayIdx, date }) => (
              <DayCard
                key={dayIdx}
                dayIdx={dayIdx}
                date={date}
                tasks={weekData[dayIdx] ?? []}
                onToggle={toggleTask}
                onDelete={deleteTask}
                onOpenDetail={(task, di) => setModal({ task, dayIdx: di })}
                onOpenAdd={(di) => setModal({ task: null, dayIdx: di })}
              />
            ))}
          </main>

          <div className={styles.unscheduledRow}>
            <DayCard
              dayIdx={5}
              date={null}
              tasks={weekData[5] ?? []}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onOpenDetail={(task, di) => setModal({ task, dayIdx: di })}
              onOpenAdd={(di) => setModal({ task: null, dayIdx: di })}
            />
          </div>

          <DragOverlay dropAnimation={null}>
            {activeDrag && (() => {
              const task = (weekData[activeDrag.fromDay] ?? []).find(t => t.id === activeDrag.taskId);
              return task ? <div className={styles.dragOverlay}>{task.text}</div> : null;
            })()}
          </DragOverlay>
        </DndContext>
      )}

      {modal && (
        <TaskModal
          task={modal.task}
          dayIdx={modal.dayIdx}
          onClose={() => setModal(null)}
          onAdd={addTask}
          onSave={editTask}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
}
