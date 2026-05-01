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
    textRef.current?.focus();
    if (!isAdd) textRef.current?.select();
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
            placeholder="输入任务名称…"
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
          {!isAdd && (
            <button className={styles.deleteBtn} onClick={handleDelete}>删除</button>
          )}
          {isAdd && <span />}
          <div className={styles.rightBtns}>
            {!isAdd && (
              <button
                className={`${styles.toggleBtn} ${task.done ? styles.undone : styles.done}`}
                onClick={() => { onToggle(dayIdx, task.id); onClose(); }}
              >
                {task.done ? '标记未完成' : '标记完成'}
              </button>
            )}
            <button className={styles.saveBtn} onClick={handleSave}>
              {isAdd ? '添加' : '保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
