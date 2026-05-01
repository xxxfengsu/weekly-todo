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
  const [detail, setDetail] = useState(null); // { task, dayIdx }

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
        <h1 className={styles.title}>每周计划</h1>
        <p className={styles.sub}>{weekId}</p>
        <button
          className={`${styles.clearBtn} ${confirming ? styles.confirm : ''}`}
          onClick={handleClear}
        >
          {confirming ? '再次点击确认清除' : '清除本周任务'}
        </button>
      </header>

      <main className={styles.board}>
        {dates.map((date, idx) => (
          <DayCard
            key={idx}
            dayIdx={idx}
            date={date}
            tasks={weekData[idx] ?? []}
            onAdd={addTask}
            onToggle={toggleTask}
            onDelete={deleteTask}
            onOpenDetail={(task, dayIdx) => setDetail({ task, dayIdx })}
          />
        ))}
      </main>

      {detail && (
        <TaskModal
          task={detail.task}
          dayIdx={detail.dayIdx}
          onClose={() => setDetail(null)}
          onSave={editTask}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
}
