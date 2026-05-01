import { useState, useEffect, useRef } from 'react';
import styles from './TaskModal.module.css';
import { DAYS } from './utils';

export default function TaskModal({ task, dayIdx, onClose, onSave, onToggle, onDelete }) {
  const [text, setText] = useState(task.text);
  const [note, setNote] = useState(task.note ?? '');
  const textRef = useRef(null);

  useEffect(() => {
    textRef.current?.focus();
    textRef.current?.select();
  }, []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSave() {
    const t = text.trim();
    if (!t) return;
    onSave(dayIdx, task.id, t, note);
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
          <button className={styles.closeBtn} onClick={onClose} aria-label="关闭">×</button>
        </div>

        <div className={styles.body}>
          <label className={styles.label}>任务</label>
          <input
            ref={textRef}
            className={styles.titleInput}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
            maxLength={100}
          />

          <label className={styles.label}>备注</label>
          <textarea
            className={styles.noteInput}
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="添加备注…"
            rows={5}
          />
        </div>

        <div className={styles.footer}>
          <button className={styles.deleteBtn} onClick={handleDelete}>删除</button>
          <div className={styles.rightBtns}>
            <button
              className={`${styles.toggleBtn} ${task.done ? styles.undone : styles.done}`}
              onClick={() => { onToggle(dayIdx, task.id); onClose(); }}
            >
              {task.done ? '标记未完成' : '标记完成'}
            </button>
            <button className={styles.saveBtn} onClick={handleSave}>保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}
