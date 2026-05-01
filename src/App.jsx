import { useMemo } from 'react';
import DayCard from './DayCard';
import { getWeekDates, getWeekId, fmtDate } from './utils';
import { useTodos } from './useTodos';
import styles from './App.module.css';

export default function App() {
  const dates = useMemo(() => getWeekDates(), []);
  const weekId = useMemo(() => getWeekId(dates[0]), [dates]);
  const { weekData, addTask, toggleTask, deleteTask } = useTodos(weekId);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>每周计划</h1>
        <p className={styles.sub}>
          {weekId} &nbsp;·&nbsp; {fmtDate(dates[0])} – {fmtDate(dates[4])}
        </p>
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
          />
        ))}
      </main>
    </div>
  );
}
