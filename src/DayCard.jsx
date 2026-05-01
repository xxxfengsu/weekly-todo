import { useDroppable } from '@dnd-kit/core';
import styles from './DayCard.module.css';
import { isToday, DAYS } from './utils';
import TaskItem from './TaskItem';

export default function DayCard({ dayIdx, date, tasks, onToggle, onDelete, onOpenDetail, onOpenAdd }) {
  const isUnscheduled = dayIdx === 5;
  const today = !isUnscheduled && date && isToday(date);
  const done = tasks.filter(t => t.done).length;

  const { setNodeRef, isOver } = useDroppable({ id: dayIdx });

  return (
    <div className={`${styles.card} ${today ? styles.today : ''} ${isUnscheduled ? styles.unscheduled : ''}`}>
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

      <ul
        ref={setNodeRef}
        className={`${styles.list} ${isOver ? styles.dragOver : ''}`}
      >
        {tasks.length === 0 && (
          <li className={styles.empty}>
            {isOver ? 'Drop here' : 'No tasks yet'}
          </li>
        )}
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            dayIdx={dayIdx}
            onToggle={onToggle}
            onDelete={onDelete}
            onOpenDetail={onOpenDetail}
          />
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
