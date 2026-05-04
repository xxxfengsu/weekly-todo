export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Unscheduled'];

export function getWeekDates() {
  const now = new Date();
  const day = now.getDay();
  const diffToMon = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMon);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}


export function fmtDate(d) {
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function isToday(d) {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
