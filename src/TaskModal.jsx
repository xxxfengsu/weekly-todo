import { useState, useEffect, useRef } from 'react';
import styles from './TaskModal.module.css';
import { DAYS } from './utils';

const URL_RE = /https?:\/\/[^\s]+/g;

function LinkifiedText({ text }) {
  const parts = [];
  let last = 0;
  let match;
  URL_RE.lastIndex = 0;
  while ((match = URL_RE.exec(text)) !== null) {
    if (match.index > last) parts.push({ type: 'text', val: text.slice(last, match.index) });
    parts.push({ type: 'link', val: match[0] });
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push({ type: 'text', val: text.slice(last) });

  return (
    <>
      {parts.map((p, i) =>
        p.type === 'link' ? (
          <a key={i} href={p.val} target="_blank" rel="noopener noreferrer"
            className={styles.noteLink} onClick={e => e.stopPropagation()}>
            {p.val}
          </a>
        ) : (
          <span key={i}>{p.val}</span>
        )
      )}
    </>
  );
}

// task=null → add mode, task=object → edit mode
export default function TaskModal({ task, dayIdx, onClose, onAdd, onSave, onToggle, onDelete }) {
  const isAdd = task === null;
  const [text, setText] = useState(task?.text ?? '');
  const [note, setNote] = useState(task?.note ?? '');
  const [noteEditing, setNoteEditing] = useState(isAdd);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const textRef = useRef(null);
  const noteAreaRef = useRef(null);
  const deleteTimerRef = useRef(null);

  useEffect(() => {
    if (isAdd) textRef.current?.focus();
  }, [isAdd]);

  useEffect(() => {
    if (noteEditing) noteAreaRef.current?.focus();
  }, [noteEditing]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSave() {
    const t = text.trim();
    if (!t) return;
    if (isAdd) onAdd(dayIdx, t, note);
    else onSave(dayIdx, task.id, t, note);
    onClose();
  }

  function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      clearTimeout(deleteTimerRef.current);
      deleteTimerRef.current = setTimeout(() => setConfirmingDelete(false), 3000);
      return;
    }
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

          {noteEditing ? (
            <textarea
              ref={noteAreaRef}
              className={styles.noteInput}
              value={note}
              onChange={e => setNote(e.target.value)}
              onBlur={() => setNoteEditing(false)}
              placeholder="Add notes…"
              rows={5}
            />
          ) : (
            <div
              className={`${styles.noteDisplay} ${!note ? styles.notePlaceholder : ''}`}
              onClick={() => setNoteEditing(true)}
            >
              {note ? <LinkifiedText text={note} /> : 'Click to add notes…'}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          {!isAdd && (
            <button
              className={`${styles.deleteBtn} ${confirmingDelete ? styles.deleteBtnConfirm : ''}`}
              onClick={handleDelete}
            >
              {confirmingDelete ? 'Sure?' : 'Delete'}
            </button>
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
