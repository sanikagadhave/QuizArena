// src/components/Badges.jsx
export function DifficultyBadge({ difficulty }) {
  const styles = {
    Easy: 'bg-emerald-50 text-emerald-700',
    Medium: 'bg-amber-50 text-amber-700',
    Hard: 'bg-rose-50 text-rose-700',
  };
  return <span className={`badge ${styles[difficulty] || 'bg-slate-100 text-slate-600'}`}>{difficulty}</span>;
}

export function CategoryBadge({ category }) {
  return <span className="badge bg-primary-50 text-primary-700">{category}</span>;
}

export function StatusBadge({ status }) {
  const map = {
    submitted: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700' },
    auto_submitted: { label: 'Auto-submitted', cls: 'bg-amber-50 text-amber-700' },
    in_progress: { label: 'In progress', cls: 'bg-blue-50 text-blue-700' },
  };
  const s = map[status] || { label: status, cls: 'bg-slate-100 text-slate-600' };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
