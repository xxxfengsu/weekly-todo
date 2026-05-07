import { useMemo, useState } from 'react';
import {
  DndContext, DragOverlay, pointerWithin,
  PointerSensor, TouchSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import DayCard from './DayCard';
import TaskModal from './TaskModal';
import { getWeekDates, fmtDate } from './utils';
import { useTodos } from './useTodos';
import styles from './App.module.css';

function getRoomId() {
  const params = new URLSearchParams(window.location.search);
  let room = params.get('room');
  if (!room) {
    room = Math.random().toString(36).slice(2, 8);
    params.set('room', room);
    window.history.replaceState({}, '', `?${params}`);
  }
  return room;
}

export default function App() {
  const dates = useMemo(() => getWeekDates(), []);
  const roomId = useMemo(() => getRoomId(), []);
  const { weekData, loading, addTask, toggleTask, packTask, deleteTask, editTask, moveTask, clearAll } = useTodos(roomId);
  const [confirming, setConfirming] = useState(false);
  const [modal, setModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);
  const [activeDrag, setActiveDrag] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  function handleDragStart({ active }) {
    setActiveDrag(active.data.current);
  }

  function handleDragEnd({ active, over }) {
    setActiveDrag(null);
    if (!over) return;
    const { taskId, fromDay } = active.data.current;
    const toDay = Number(over.id);
    if (fromDay !== toDay) moveTask(fromDay, toDay, taskId);
  }

  function handleClear() {
    if (!confirming) {
      setConfirming(true);
      setTimeout(() => setConfirming(false), 3000);
      return;
    }
    clearAll();
    setConfirming(false);
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExport() {
    const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const fmtEn = d => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
    const year = dates[0].getFullYear();

    const TAG_RE = /\b(IN|OUT)\b/g;
    const highlightTags = text => text.replace(TAG_RE, (m) =>
      m === 'IN'
        ? '<span class="tag-in">IN</span>'
        : '<span class="tag-out">OUT</span>'
    );

    const dayBlocks = dates.map((date, idx) => {
      const tasks = weekData[idx] ?? [];
      const total = tasks.length;
      const done = tasks.filter(t => t.done).length;
      const taskRows = total === 0
        ? '<div class="empty">No tasks</div>'
        : tasks.map((task, i) => `
            <div class="task${task.done ? ' done' : ''}">
              <span class="check">${task.done ? '✓' : ''}</span>
              <div class="task-body">
                <span class="task-text">${highlightTags(task.text)}</span>
                ${task.note ? `<div class="note">${task.note}</div>` : ''}
              </div>
            </div>
            ${i < total - 1 ? '<div class="divider"></div>' : ''}
          `).join('');
      return `
        <div class="day">
          <div class="day-header">
            <div class="day-name">${DAY_NAMES[idx]}</div>
            <div class="day-meta">
              <span class="day-date">${fmtEn(date)}</span>
              ${total > 0 ? `<span class="badge">${done}/${total}</span>` : ''}
            </div>
          </div>
          <div class="tasks">${taskRows}</div>
        </div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Weekly Planner — ${fmtEn(dates[0])} ${year}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', -apple-system, sans-serif;
    background: #f8fafc;
    color: #1e293b;
    padding: 40px 36px 48px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* ── Header ── */
  .header {
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e2e8f0;
  }
  .title { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; }
  .subtitle { font-size: .9rem; color: #94a3b8; margin-top: 4px; }

  /* ── Grid ── */
  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
  }

  /* ── Day Card ── */
  .day {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.04);
  }
  .day-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px 14px;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 1px solid #e2e8f0;
  }
  .day-name { font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: #475569; }
  .day-meta { display: flex; align-items: center; gap: 6px; }
  .day-date { font-size: .75rem; color: #94a3b8; font-weight: 500; }
  .badge {
    font-size: .65rem;
    font-weight: 700;
    background: #ede9fe;
    color: #6d28d9;
    padding: 1px 6px;
    border-radius: 20px;
  }

  /* ── Tasks ── */
  .tasks { padding: 16px 20px 20px; }
  .empty { font-size: .75rem; color: #cbd5e1; text-align: center; padding: 24px 0; }

  .task {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 0;
  }
  .check {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    border-radius: 4px;
    border: 1.5px solid #c7d2fe;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: .65rem;
    font-weight: 700;
    color: #fff;
    margin-top: 1px;
  }
  .task.done .check { background: #4f46e5; border-color: #4f46e5; }
  .task-body { flex: 1; min-width: 0; }
  .task-text { font-size: .8rem; font-weight: 500; line-height: 1.4; color: #1e293b; word-break: break-word; }
  .task.done .task-text { text-decoration: line-through; color: #94a3b8; }
  .note {
    margin-top: 4px;
    font-size: .72rem;
    color: #64748b;
    line-height: 1.5;
    padding: 3px 8px;
    background: #f8fafc;
    border-left: 2px solid #c7d2fe;
    border-radius: 0 4px 4px 0;
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: pre-wrap;
  }

  .tag-in {
    display: inline-block;
    background: #dcfce7;
    color: #16a34a;
    border-radius: 4px;
    padding: 0 5px;
    font-size: .7rem;
    font-weight: 700;
    letter-spacing: .02em;
    vertical-align: middle;
    line-height: 1.6;
  }
  .tag-out {
    display: inline-block;
    background: #fee2e2;
    color: #dc2626;
    border-radius: 4px;
    padding: 0 5px;
    font-size: .7rem;
    font-weight: 700;
    letter-spacing: .02em;
    vertical-align: middle;
    line-height: 1.6;
  }

  .divider {
    height: 1px;
    background: linear-gradient(to right, transparent, #e2e8f0 20%, #e2e8f0 80%, transparent);
    margin: 2px 0;
  }

  /* ── Print ── */
  @media print {
    @page { size: A4 landscape; margin: 14mm 12mm; }
    body { background: #fff; padding: 0; }
    .day { box-shadow: none; border: 1px solid #e2e8f0; }
  }
</style>
</head>
<body>
<div class="header">
  <div class="title">Weekly Planner</div>
  <div class="subtitle">${fmtEn(dates[0])} – ${fmtEn(dates[4])}, ${year}</div>
</div>
<div class="grid">${dayBlocks}</div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `weekly-${dates[0].toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 2000);
  }

  const weekColumns = dates.map((date, idx) => ({ dayIdx: idx, date }));

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Weekly Planner</h1>
        <div className={styles.actions}>
          <button className={styles.exportBtn} onClick={handleExport}>
            {exported ? '✓ Exported!' : 'Export .html'}
          </button>
          <button className={styles.shareBtn} onClick={handleCopyLink}>
            {copied ? '✓ Copied!' : 'Share Link'}
          </button>
          <button
            className={`${styles.clearBtn} ${confirming ? styles.confirm : ''}`}
            onClick={handleClear}
          >
            {confirming ? 'Confirm Clear' : 'Clear This Week'}
          </button>
        </div>
      </header>

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <main className={styles.board}>
            {weekColumns.map(({ dayIdx, date }) => (
              <DayCard
                key={dayIdx}
                dayIdx={dayIdx}
                date={date}
                tasks={weekData[dayIdx] ?? []}
                onToggle={toggleTask}
                onPack={packTask}
                onDelete={deleteTask}
                onOpenDetail={(task, di) => setModal({ task, dayIdx: di })}
                onOpenAdd={(di) => setModal({ task: null, dayIdx: di })}
              />
            ))}
          </main>

          <div className={styles.unscheduledRow}>
            <DayCard
              dayIdx={5}
              date={null}
              tasks={weekData[5] ?? []}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onOpenDetail={(task, di) => setModal({ task, dayIdx: di })}
              onOpenAdd={(di) => setModal({ task: null, dayIdx: di })}
            />
          </div>

          <div className={styles.workOrdersRow}>
            <DayCard
              dayIdx={6}
              date={null}
              tasks={weekData[6] ?? []}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onOpenDetail={(task, di) => setModal({ task, dayIdx: di })}
              onOpenAdd={(di) => setModal({ task: null, dayIdx: di })}
            />
          </div>

          <DragOverlay dropAnimation={null}>
            {activeDrag && (() => {
              const task = (weekData[activeDrag.fromDay] ?? []).find(t => t.id === activeDrag.taskId);
              return task ? <div className={styles.dragOverlay}>{task.text}</div> : null;
            })()}
          </DragOverlay>
        </DndContext>
      )}

      {modal && (
        <TaskModal
          task={modal.task}
          dayIdx={modal.dayIdx}
          onClose={() => setModal(null)}
          onAdd={addTask}
          onSave={editTask}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
}
