// src/components/QuestionNav.jsx
export function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;
  return (
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-primary-500 to-violet-500 transition-all duration-300" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function QuestionNav({ questions, current, answers, onJump }) {
  return (
    <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
      {questions.map((q, idx) => {
        const answered = answers[q.id] != null;
        const isCurrent = idx === current;
        return (
          <button
            key={q.id}
            onClick={() => onJump(idx)}
            className={`h-9 w-9 rounded-lg text-sm font-semibold border transition-all ${
              isCurrent
                ? 'bg-primary-600 text-white border-primary-600 scale-110 shadow-md'
                : answered
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );
}
