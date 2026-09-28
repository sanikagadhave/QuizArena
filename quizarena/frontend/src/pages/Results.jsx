// src/pages/Results.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { attemptApi } from '../api';
import { Trophy, CheckCircle2, XCircle, RotateCcw, LayoutDashboard, Loader2 } from 'lucide-react';

function scoreColor(pct) {
  if (pct >= 80) return 'text-emerald-600';
  if (pct >= 50) return 'text-amber-600';
  return 'text-rose-600';
}

export default function Results() {
  const { attemptId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => { attemptApi.review(attemptId).then(setData); }, [attemptId]);

  if (!data) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;
  }

  const { attempt, quiz, review } = data;
  const pct = attempt.totalPoints > 0 ? Math.round((attempt.score / attempt.totalPoints) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="card p-8 text-center mb-8 relative overflow-hidden">
        <div className={`absolute inset-x-0 top-0 h-1.5 ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} />
        <Trophy className={`mx-auto mb-3 ${scoreColor(pct)}`} size={40} />
        <p className="text-sm text-slate-500">{quiz.title}</p>
        <h1 className={`font-display font-extrabold text-5xl mt-2 ${scoreColor(pct)}`}>{pct}%</h1>
        <p className="text-slate-600 mt-2">
          You scored <strong>{attempt.score}</strong> out of <strong>{attempt.totalPoints}</strong> points
          ({attempt.correctCount}/{attempt.totalQuestions} correct)
        </p>
        {attempt.status === 'auto_submitted' && (
          <p className="text-xs text-amber-600 font-medium mt-2 bg-amber-50 inline-block px-3 py-1 rounded-full">
            ⏱ Auto-submitted when time ran out
          </p>
        )}
        <div className="flex items-center justify-center gap-3 mt-6">
          <Link to="/browse" className="btn-secondary"><RotateCcw size={16} /> Try Another Quiz</Link>
          <Link to="/dashboard" className="btn-primary"><LayoutDashboard size={16} /> Dashboard</Link>
        </div>
      </div>

      <h2 className="font-display font-bold text-xl text-slate-900 mb-4">Answer Review</h2>
      <div className="space-y-4">
        {review.map((r, idx) => (
          <div key={r.questionId} className="card p-5">
            <div className="flex items-start gap-3">
              {r.isCorrect ? (
                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={20} />
              ) : (
                <XCircle className="text-rose-500 shrink-0 mt-0.5" size={20} />
              )}
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-400 mb-1">QUESTION {idx + 1}</p>
                <p className="font-medium text-slate-800 mb-3">{r.questionText}</p>
                <div className="space-y-2">
                  {['a', 'b', 'c', 'd'].map((opt) => {
                    const isCorrectOpt = opt === r.correctOption;
                    const isSelected = opt === r.selectedOption;
                    let style = 'border-slate-200 text-slate-600';
                    if (isCorrectOpt) style = 'border-emerald-400 bg-emerald-50 text-emerald-800';
                    else if (isSelected && !isCorrectOpt) style = 'border-rose-300 bg-rose-50 text-rose-700';
                    return (
                      <div key={opt} className={`text-sm px-3 py-2 rounded-lg border flex items-center justify-between ${style}`}>
                        <span><strong className="uppercase mr-1.5">{opt}.</strong>{r.options[opt]}</span>
                        {isCorrectOpt && <span className="text-xs font-semibold">Correct answer</span>}
                        {isSelected && !isCorrectOpt && <span className="text-xs font-semibold">Your answer</span>}
                      </div>
                    );
                  })}
                  {!r.selectedOption && (
                    <p className="text-xs text-slate-400 italic">You did not answer this question.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
