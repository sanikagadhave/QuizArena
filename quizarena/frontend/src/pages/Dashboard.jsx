// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quizApi, attemptApi } from '../api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import QuizCard from '../components/QuizCard';
import { Target, CheckCircle2, TrendingUp, Flame, ArrowRight } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([attemptApi.stats(), quizApi.list({})])
      .then(([s, q]) => { setStats(s); setQuizzes(q.slice(0, 4)); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="font-display font-extrabold text-3xl text-slate-900">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500 mt-1">Here's a snapshot of your progress so far.</p>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[...Array(4)].map((_, i) => <div key={i} className="card p-5 h-24 animate-pulse bg-slate-50" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard icon={Target} label="Quizzes Attempted" value={stats?.totalAttempts ?? 0} accent="primary" />
          <StatCard icon={CheckCircle2} label="Accuracy" value={`${stats?.accuracyPct ?? 0}%`} accent="emerald" />
          <StatCard icon={TrendingUp} label="Average Score" value={`${stats?.avgScorePct ?? 0}%`} accent="violet" />
          <StatCard icon={Flame} label="Best Score" value={`${stats?.bestScorePct ?? 0}%`} accent="amber" />
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-bold text-xl text-slate-900">Popular Quizzes</h2>
        <Link to="/browse" className="text-primary-600 text-sm font-semibold flex items-center gap-1 hover:underline">
          Browse all <ArrowRight size={15} />
        </Link>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => <div key={i} className="card h-64 animate-pulse bg-slate-50" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {quizzes.map(q => <QuizCard key={q.id} quiz={q} />)}
        </div>
      )}

      {stats?.categoryBreakdown?.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display font-bold text-xl text-slate-900 mb-4">Performance by Category</h2>
          <div className="card p-6 space-y-4">
            {stats.categoryBreakdown.map(c => (
              <div key={c.category}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700">{c.category}</span>
                  <span className="text-slate-500">{c.avgPct}% avg · {c.attempts} attempt{c.attempts > 1 ? 's' : ''}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-violet-500" style={{ width: `${c.avgPct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
