export const DAYS = [
  { key: "mon", label: "Monday", short: "Mon" },
  { key: "tue", label: "Tuesday", short: "Tue" },
  { key: "wed", label: "Wednesday", short: "Wed" },
  { key: "thu", label: "Thursday", short: "Thu" },
  { key: "fri", label: "Friday", short: "Fri" },
  { key: "sat", label: "Saturday", short: "Sat" },
  { key: "sun", label: "Sunday", short: "Sun" },
];

const pad = (n) => String(n).padStart(2, "0");

// Local-date ISO string (YYYY-MM-DD), avoiding UTC shifts from toISOString().
export function toISODate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromISODate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Monday of the week containing `date`.
export function weekStartOf(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
  d.setDate(d.getDate() - offset);
  return toISODate(d);
}

export function addWeeks(weekStart, n) {
  const d = fromISODate(weekStart);
  d.setDate(d.getDate() + n * 7);
  return toISODate(d);
}

export function dayDate(weekStart, index) {
  const d = fromISODate(weekStart);
  d.setDate(d.getDate() + index);
  return d;
}

export function formatWeekRange(weekStart) {
  const start = fromISODate(weekStart);
  const end = dayDate(weekStart, 6);
  const opts = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}`;
}
