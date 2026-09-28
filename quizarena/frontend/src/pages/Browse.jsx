// src/pages/Browse.jsx
import { useEffect, useState, useCallback } from 'react';
import { quizApi } from '../api';
import QuizCard from '../components/QuizCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export default function Browse() {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { quizApi.categories().then(setCategories); }, []);

  const fetchQuizzes = useCallback(() => {
    setLoading(true);
    quizApi.list({ search: search || undefined, category: category || undefined, difficulty: difficulty || undefined })
      .then(setQuizzes)
      .finally(() => setLoading(false));
  }, [search, category, difficulty]);

  useEffect(() => {
    const t = setTimeout(fetchQuizzes, 300); // debounce search
    return () => clearTimeout(t);
  }, [fetchQuizzes]);

  const clearFilters = () => { setSearch(''); setCategory(''); setDifficulty(''); };
  const hasFilters = search || category || difficulty;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl text-slate-900">Browse Quizzes</h1>
        <p className="text-slate-500 mt-1">Search by topic, or filter by category and difficulty.</p>
      </div>

      <div className="card p-4 mb-8 flex flex-col lg:flex-row gap-3 lg:items-center">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-10"
            placeholder="Search quizzes by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3 flex-wrap">
          <select className="input lg:w-44" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input lg:w-40" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="">All Levels</option>
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost text-rose-600">
              <X size={15} /> Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-64 animate-pulse bg-slate-50" />)}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-20">
          <SlidersHorizontal size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No quizzes match your filters.</p>
          <button onClick={clearFilters} className="text-primary-600 text-sm font-semibold mt-2 hover:underline">Clear filters</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {quizzes.map(q => <QuizCard key={q.id} quiz={q} />)}
        </div>
      )}
    </div>
  );
}
