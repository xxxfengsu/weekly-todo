import styles from './DayCard.module.css';
import { isToday, DAYS } from './utils';

export default function DayCard({ dayIdx, date, tasks, onToggle, onDelete, onOpenDetail, onOpenAdd }) {
  const today = isToday(date);
  const done = tasks.filter(t => t.done).length;

  return (
    <div className={`${styles.card} ${today ? styles.today : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.dayName}>{DAYS[dayIdx]}</span>
          {today && <span className={styles.badge}>Today</span>}
        </div>
        {tasks.length > 0 && (
          <div className={styles.meta}>
            <span className={styles.progress}>{done}/{tasks.length}</span>
          </div>
        )}
      </div>

      <ul className={styles.list}>
        {tasks.length === 0 && (
          <li className={styles.empty}>No tasks yet</li>
        )}
        {tasks.map(task => (
          <li
            key={task.id}
            className={`${styles.item} ${task.done ? styles.done : ''}`}
            onDoubleClick={() => onOpenDetail(task, dayIdx)}
            title="Double-click to view details"
          >
            <button
              className={`${styles.check} ${task.done ? styles.checked : ''}`}
              onClick={() => onToggle(dayIdx, task.id)}
              aria-label={task.done ? 'Mark incomplete' : 'Mark complete'}
            >
              {task.done && (
                <svg viewBox="0 0 12 12" fill="none">
                  <polyline points="1.5,6 4.5,9.5 10.5,2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <span className={styles.taskText}>
              {task.text}
              {task.note && <span className={styles.noteHint}> · note</span>}
            </span>
            <button
              className={styles.del}
              onClick={() => onDelete(dayIdx, task.id)}
              aria-label="Delete"
            >×</button>
          </li>
        ))}
      </ul>

      <div className={styles.addArea}>
        <button className={styles.addBtn} onClick={() => onOpenAdd(dayIdx)}>
          <svg viewBox="0 0 16 16" fill="none">
            <line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
          Add task
        </button>
      </div>
    </div>
  );
}
