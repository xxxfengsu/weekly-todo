import { useState, useRef } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import styles from './DayCard.module.css';

const isTouch = window.matchMedia('(hover: none)').matches;
const TAG_RE = /\bIN\b|\bOUT\b|WO/g;

function tagClass(tag, styles) {
  if (tag === 'IN') return styles.tagIn;
  if (tag === 'OUT') return styles.tagOut;
  return styles.tagWo;
}

function renderText(text, styles) {
  const parts = [];
  let last = 0;
  let match;
  TAG_RE.lastIndex = 0;
  while ((match = TAG_RE.exec(text)) !== null) {
    if (match.index > last) parts.push(<span key={last}>{text.slice(last, match.index)}</span>);
    parts.push(
      <span key={match.index} className={tagClass(match[0], styles)}>
        {match[0]}
      </span>
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(<span key={last}>{text.slice(last)}</span>);
  return parts.length ? parts : text;
}

const HAS_OUT_RE = /\bOUT\b/;

export default function TaskItem({ task, dayIdx, onToggle, onPack, onDelete, onOpenDetail }) {
  const isOutTask = HAS_OUT_RE.test(task.text);
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
        {renderText(task.text, styles)}
        {task.note && <span className={styles.noteHint}> · note</span>}
      </span>
      {isOutTask && (
        <button
          className={`${styles.pack} ${task.packed ? styles.packActive : ''}`}
          onClick={e => { e.stopPropagation(); onPack(dayIdx, task.id); }}
          title={task.packed ? 'Unpack' : 'Pack'}
          aria-label={task.packed ? 'Unpack' : 'Pack'}
        >
          <svg viewBox="0 0 16 16" fill="none">
            <rect x="1" y="5" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M1 5l2-4h10l2 4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
            <path d="M6 5v2.5a2 2 0 004 0V5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
      )}
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
