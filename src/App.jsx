import { useMemo, useState } from 'react';
import DayCard from './DayCard';
import TaskModal from './TaskModal';
import { getWeekDates, getWeekId } from './utils';
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
  const weekId = useMemo(() => getWeekId(dates[0]), [dates]);
  const roomId = useMemo(() => getRoomId(), []);
  const { weekData, loading, addTask, toggleTask, deleteTask, editTask, clearWeek } = useTodos(roomId, weekId);
  const [confirming, setConfirming] = useState(false);
  const [modal, setModal] = useState(null);
  const [copied, setCopied] = useState(false);

  function handleClear() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    clearWeek();
    setConfirming(false);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Weekly Planner</h1>
        <p className={styles.sub}>{weekId}</p>
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
        <main className={styles.board}>
          {dates.map((date, idx) => (
            <DayCard
              key={idx}
              dayIdx={idx}
              date={date}
              tasks={weekData[idx] ?? []}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onOpenDetail={(task, dayIdx) => setModal({ task, dayIdx })}
              onOpenAdd={(dayIdx) => setModal({ task: null, dayIdx })}
            />
          ))}
        </main>
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
