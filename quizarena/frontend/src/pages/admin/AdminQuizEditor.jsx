// src/pages/admin/AdminQuizEditor.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizApi } from '../../api';
import { v4 as uuid } from 'uuid';
import { PlusCircle, Trash2, Save, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';

const emptyQuestion = () => ({
  key: uuid(),
  questionText: '',
  options: { a: '', b: '', c: '', d: '' },
  correctOption: 'a',
  points: 1,
});

export default function AdminQuizEditor() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', category: '', difficulty: 'Easy', durationMinutes: 10, isPublished: true,
  });
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEdit) return;
    quizApi.get(id).then((q) => {
      setForm({
        title: q.title, description: q.description || '', category: q.category,
        difficulty: q.difficulty, durationMinutes: q.durationMinutes, isPublished: q.isPublished,
      });
      setQuestions(q.questions.map((qq) => ({
        key: qq.id, questionText: qq.questionText, options: qq.options,
        correctOption: qq.correctOption || 'a', points: qq.points,
      })));
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  const updateQuestion = (key, patch) => {
    setQuestions((qs) => qs.map((q) => (q.key === key ? { ...q, ...patch } : q)));
  };
  const updateOption = (key, opt, value) => {
    setQuestions((qs) => qs.map((q) => (q.key === key ? { ...q, options: { ...q.options, [opt]: value } } : q)));
  };
  const addQuestion = () => setQuestions((qs) => [...qs, emptyQuestion()]);
  const removeQuestion = (key) => setQuestions((qs) => (qs.length > 1 ? qs.filter((q) => q.key !== key) : qs));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    for (const [idx, q] of questions.entries()) {
      if (!q.questionText.trim() || Object.values(q.options).some((o) => !o.trim())) {
        setError(`Question ${idx + 1} is incomplete - fill in the question text and all four options.`);
        return;
      }
    }

    setSaving(true);
    const payload = {
      ...form,
      durationMinutes: Number(form.durationMinutes),
      questions: questions.map((q) => ({
        questionText: q.questionText, options: q.options, correctOption: q.correctOption, points: Number(q.points) || 1,
      })),
    };
    try {
      if (isEdit) await quizApi.update(id, payload);
      else await quizApi.create(payload);
      navigate('/admin/quizzes');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save quiz.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <button onClick={() => navigate('/admin/quizzes')} className="btn-ghost mb-4 -ml-3">
        <ArrowLeft size={16} /> Back to quizzes
      </button>
      <h1 className="font-display font-extrabold text-3xl text-slate-900 mb-8">{isEdit ? 'Edit Quiz' : 'Create New Quiz'}</h1>

      {error && (
        <div className="mb-6 flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="card p-6 space-y-4">
          <h2 className="font-display font-bold text-slate-900">Quiz Details</h2>
          <div>
            <label className="label">Title</label>
            <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Category</label>
              <input required className="input" placeholder="e.g. Programming" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div>
              <label className="label">Difficulty</label>
              <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </select>
            </div>
            <div>
              <label className="label">Duration (minutes)</label>
              <input required type="number" min="1" max="180" className="input" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 pt-1">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="rounded" />
            Published (visible to students)
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-slate-900">Questions ({questions.length})</h2>
            <button type="button" onClick={addQuestion} className="btn-secondary text-sm"><PlusCircle size={15} /> Add Question</button>
          </div>

          <div className="space-y-5">
            {questions.map((q, idx) => (
              <div key={q.key} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-primary-600">QUESTION {idx + 1}</p>
                  <button type="button" onClick={() => removeQuestion(q.key)} className="btn-ghost text-rose-500 py-1">
                    <Trash2 size={14} />
                  </button>
                </div>
                <textarea
                  required
                  className="input mb-3"
                  rows={2}
                  placeholder="Enter question text..."
                  value={q.questionText}
                  onChange={(e) => updateQuestion(q.key, { questionText: e.target.value })}
                />
                <div className="grid sm:grid-cols-2 gap-3 mb-3">
                  {['a', 'b', 'c', 'd'].map((opt) => (
                    <div key={opt} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${q.key}`}
                        checked={q.correctOption === opt}
                        onChange={() => updateQuestion(q.key, { correctOption: opt })}
                        className="shrink-0"
                        title="Mark as correct answer"
                      />
                      <input
                        required
                        className="input"
                        placeholder={`Option ${opt.toUpperCase()}`}
                        value={q.options[opt]}
                        onChange={(e) => updateOption(q.key, opt, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-500">Points:</label>
                  <input
                    type="number" min="1" className="input w-20 py-1.5 text-sm"
                    value={q.points}
                    onChange={(e) => updateQuestion(q.key, { points: e.target.value })}
                  />
                  <span className="text-xs text-slate-400 ml-auto">Select the radio button next to the correct option</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 sticky bottom-4">
          <button type="button" onClick={() => navigate('/admin/quizzes')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> {isEdit ? 'Save Changes' : 'Create Quiz'}</>}
          </button>
        </div>
      </form>
    </div>
  );
}
