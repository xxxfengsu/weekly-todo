import { useState, useRef } from 'react';
import styles from './DayCard.module.css';
import { isToday, DAYS } from './utils';

export default function DayCard({ dayIdx, date, tasks, onAdd, onToggle, onDelete }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);
  const today = isToday(date);

  function handleSubmit(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onAdd(dayIdx, t);
    setText('');
    inputRef.current?.focus();
  }

  const done = tasks.filter(t => t.done).length;

  return (
    <div className={`${styles.card} ${today ? styles.today : ''}`}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.dayName}>{DAYS[dayIdx]}</span>
          {today && <span className={styles.badge}>今天</span>}
        </div>
        {tasks.length > 0 && (
          <div className={styles.meta}>
            <span className={styles.progress}>{done}/{tasks.length}</span>
          </div>
        )}
      </div>

      <ul className={styles.list}>
        {tasks.length === 0 && (
          <li className={styles.empty}>暂无任务</li>
        )}
        {tasks.map(task => (
          <li key={task.id} className={`${styles.item} ${task.done ? styles.done : ''}`}>
            <button
              className={`${styles.check} ${task.done ? styles.checked : ''}`}
              onClick={() => onToggle(dayIdx, task.id)}
              aria-label={task.done ? '标记未完成' : '标记完成'}
            >
              {task.done && (
                <svg viewBox="0 0 12 12" fill="none">
                  <polyline points="1.5,6 4.5,9.5 10.5,2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
            <span className={styles.taskText}>{task.text}</span>
            <button
              className={styles.del}
              onClick={() => onDelete(dayIdx, task.id)}
              aria-label="删除"
            >×</button>
          </li>
        ))}
      </ul>

      <form className={styles.addForm} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className={styles.input}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="添加任务…"
          maxLength={100}
        />
        <button className={styles.addBtn} type="submit" aria-label="添加">
          <svg viewBox="0 0 16 16" fill="none">
            <line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
            <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </button>
      </form>
    </div>
  );
}
