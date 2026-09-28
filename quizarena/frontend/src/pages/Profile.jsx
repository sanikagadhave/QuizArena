// src/pages/Profile.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { attemptApi } from '../api';
import StatCard from '../components/StatCard';
import { Target, CheckCircle2, TrendingUp, Flame, Mail, Calendar, Loader2 } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => { attemptApi.stats().then(setStats); }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="card p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
        <span
          className="h-20 w-20 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shrink-0"
          style={{ backgroundColor: user?.avatarColor }}
        >
          {user?.name?.[0]?.toUpperCase()}
        </span>
        <div className="text-center sm:text-left">
          <h1 className="font-display font-extrabold text-2xl text-slate-900">{user?.name}</h1>
          <p className="text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 mt-1"><Mail size={14} /> {user?.email}</p>
          <p className="text-slate-400 text-sm flex items-center justify-center sm:justify-start gap-1.5 mt-1">
            <Calendar size={14} /> Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
          </p>
          <span className="badge bg-primary-50 text-primary-700 mt-3 inline-flex capitalize">{user?.role}</span>
        </div>
      </div>

      <h2 className="font-display font-bold text-xl text-slate-900 mb-4">Statistics</h2>
      {!stats ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard icon={Target} label="Total Attempts" value={stats.totalAttempts} accent="primary" />
            <StatCard icon={CheckCircle2} label="Accuracy" value={`${stats.accuracyPct}%`} accent="emerald" />
            <StatCard icon={TrendingUp} label="Average Score" value={`${stats.avgScorePct}%`} accent="violet" />
            <StatCard icon={Flame} label="Best Score" value={`${stats.bestScorePct}%`} accent="amber" />
          </div>

          {stats.categoryBreakdown.length > 0 && (
            <div className="card p-6">
              <h3 className="font-display font-bold text-slate-900 mb-4">Performance by Category</h3>
              <div className="space-y-4">
                {stats.categoryBreakdown.map((c) => (
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
        </>
      )}
    </div>
  );
}
