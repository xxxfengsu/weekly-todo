import { useState, useEffect, useRef } from 'react';
import styles from './TaskModal.module.css';
import { DAYS } from './utils';

// task=null → add mode, task=object → edit mode
export default function TaskModal({ task, dayIdx, onClose, onAdd, onSave, onToggle, onDelete }) {
  const isAdd = task === null;
  const [text, setText] = useState(task?.text ?? '');
  const [note, setNote] = useState(task?.note ?? '');
  const textRef = useRef(null);

  useEffect(() => {
    if (isAdd) textRef.current?.focus();
  }, [isAdd]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSave() {
    const t = text.trim();
    if (!t) return;
    if (isAdd) {
      onAdd(dayIdx, t, note);
    } else {
      onSave(dayIdx, task.id, t, note);
    }
    onClose();
  }

  function handleDelete() {
    onDelete(dayIdx, task.id);
    onClose();
  }

  return (
    <div className={styles.backdrop} onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <span className={styles.dayTag}>{DAYS[dayIdx]}</span>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className={styles.body}>
          <label className={styles.label}>Task</label>
          <input
            ref={textRef}
            className={styles.titleInput}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            placeholder="Enter task name…"
            maxLength={100}
          />

          <label className={styles.label}>Notes</label>
          <textarea
            className={styles.noteInput}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Add notes…"
            rows={5}
          />
        </div>

        <div className={styles.footer}>
          {!isAdd && (
            <button className={styles.deleteBtn} onClick={handleDelete}>Delete</button>
          )}
          {isAdd && <span />}
          <div className={styles.rightBtns}>
            {!isAdd && (
              <button
                className={`${styles.toggleBtn} ${task.done ? styles.undone : styles.done}`}
                onClick={() => { onToggle(dayIdx, task.id); onClose(); }}
              >
                {task.done ? 'Mark Incomplete' : 'Mark Complete'}
              </button>
            )}
            <button className={styles.saveBtn} onClick={handleSave}>
              {isAdd ? 'Add' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
