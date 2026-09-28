// src/pages/History.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { attemptApi } from '../api';
import { DifficultyBadge, CategoryBadge, StatusBadge } from '../components/Badges';
import { Eye, Inbox, Loader2 } from 'lucide-react';

export default function History() {
  const [history, setHistory] = useState(null);

  useEffect(() => { attemptApi.history().then(setHistory); }, []);

  if (!history) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl text-slate-900">Quiz History</h1>
        <p className="text-slate-500 mt-1">Every quiz you've completed, with your score and review.</p>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20">
          <Inbox size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">You haven't completed any quizzes yet.</p>
          <Link to="/browse" className="text-primary-600 text-sm font-semibold mt-2 inline-block hover:underline">Browse quizzes</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Quiz</th>
                <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">Category</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Difficulty</th>
                <th className="text-left px-5 py-3 font-semibold">Score</th>
                <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">Status</th>
                <th className="text-left px-5 py-3 font-semibold hidden lg:table-cell">Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-800">{a.quizTitle}</td>
                  <td className="px-5 py-3.5 hidden sm:table-cell"><CategoryBadge category={a.category} /></td>
                  <td className="px-5 py-3.5 hidden md:table-cell"><DifficultyBadge difficulty={a.difficulty} /></td>
                  <td className="px-5 py-3.5">
                    <span className={`font-bold ${a.percentage >= 80 ? 'text-emerald-600' : a.percentage >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {a.percentage}%
                    </span>
                    <span className="text-slate-400 text-xs ml-1">({a.score}/{a.totalPoints})</span>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell"><StatusBadge status={a.status} /></td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-slate-500">{new Date(a.submittedAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link to={`/results/${a.id}`} className="btn-ghost text-primary-600">
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
