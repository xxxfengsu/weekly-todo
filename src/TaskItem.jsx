import { useState, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import styles from './DayCard.module.css';

const isTouch = window.matchMedia('(hover: none)').matches;

export default function TaskItem({ task, dayIdx, onToggle, onDelete, onOpenDetail }) {
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { taskId: task.id, fromDay: dayIdx },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.25 : 1,
    touchAction: 'none',
    cursor: 'grab',
  };

  function handleDelete(e) {
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setConfirming(false), 3000);
    } else {
      clearTimeout(timerRef.current);
      setConfirming(false);
      onDelete(dayIdx, task.id);
    }
  }

  const detailHandlers = isTouch
    ? { onClick: () => onOpenDetail(task, dayIdx) }
    : { onDoubleClick: () => onOpenDetail(task, dayIdx), title: 'Double-click to view details' };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`${styles.item} ${task.done ? styles.done : ''}`}
      {...listeners}
      {...attributes}
      {...detailHandlers}
    >
      <button
        className={`${styles.check} ${task.done ? styles.checked : ''}`}
        onClick={e => { e.stopPropagation(); onToggle(dayIdx, task.id); }}
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
        className={`${styles.del} ${confirming ? styles.delConfirm : ''}`}
        onClick={handleDelete}
        title={confirming ? 'Click again to confirm' : 'Delete'}
      >
        {confirming ? '?' : '×'}
      </button>
    </li>
  );
}
