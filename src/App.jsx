import { useMemo, useState } from 'react';
import DayCard from './DayCard';
import TaskModal from './TaskModal';
import { getWeekDates, getWeekId } from './utils';
import { useTodos } from './useTodos';
import styles from './App.module.css';

export default function App() {
  const dates = useMemo(() => getWeekDates(), []);
  const weekId = useMemo(() => getWeekId(dates[0]), [dates]);
  const { weekData, addTask, toggleTask, deleteTask, editTask, clearWeek } = useTodos(weekId);
  const [confirming, setConfirming] = useState(false);
  // modal: null | { task: null (add) | task-object (edit), dayIdx }
  const [modal, setModal] = useState(null);

  function handleClear() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    clearWeek();
    setConfirming(false);
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Weekly Planner</h1>
        <p className={styles.sub}>{weekId}</p>
        <button
          className={`${styles.clearBtn} ${confirming ? styles.confirm : ''}`}
          onClick={handleClear}
        >
          {confirming ? 'Confirm Clear' : 'Clear This Week'}
        </button>
      </header>

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
