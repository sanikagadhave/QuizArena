// src/pages/admin/AdminQuizzes.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quizApi } from '../../api';
import { DifficultyBadge, CategoryBadge } from '../../components/Badges';
import { PlusCircle, Pencil, Trash2, Loader2, EyeOff, Eye } from 'lucide-react';

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = () => quizApi.list({}).then(setQuizzes);
  useEffect(() => { load(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await quizApi.remove(id);
      setQuizzes((qs) => qs.filter((q) => q.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!quizzes) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-slate-900">Manage Quizzes</h1>
          <p className="text-slate-500 mt-1">Create, edit, publish, or remove quizzes.</p>
        </div>
        <Link to="/admin/quizzes/new" className="btn-primary"><PlusCircle size={16} /> New Quiz</Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Title</th>
              <th className="text-left px-5 py-3 font-semibold hidden sm:table-cell">Category</th>
              <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Difficulty</th>
              <th className="text-left px-5 py-3 font-semibold">Questions</th>
              <th className="text-left px-5 py-3 font-semibold hidden lg:table-cell">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {quizzes.map((q) => (
              <tr key={q.id} className="hover:bg-slate-50/60">
                <td className="px-5 py-3.5 font-medium text-slate-800">{q.title}</td>
                <td className="px-5 py-3.5 hidden sm:table-cell"><CategoryBadge category={q.category} /></td>
                <td className="px-5 py-3.5 hidden md:table-cell"><DifficultyBadge difficulty={q.difficulty} /></td>
                <td className="px-5 py-3.5 text-slate-600">{q.questionCount}</td>
                <td className="px-5 py-3.5 hidden lg:table-cell">
                  {q.isPublished ? (
                    <span className="badge bg-emerald-50 text-emerald-700"><Eye size={12} /> Published</span>
                  ) : (
                    <span className="badge bg-slate-100 text-slate-500"><EyeOff size={12} /> Draft</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                  <Link to={`/admin/quizzes/${q.id}/edit`} className="btn-ghost text-primary-600"><Pencil size={15} /></Link>
                  <button onClick={() => handleDelete(q.id, q.title)} disabled={deletingId === q.id} className="btn-ghost text-rose-600">
                    {deletingId === q.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
