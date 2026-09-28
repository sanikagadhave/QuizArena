// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import StatCard from '../../components/StatCard';
import { Users, BookOpen, ClipboardCheck, TrendingUp, Loader2, PlusCircle, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => { adminApi.overview().then(setData); }, []);

  if (!data) return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage quizzes and monitor platform activity.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/quizzes" className="btn-secondary"><Settings size={16} /> Manage Quizzes</Link>
          <Link to="/admin/quizzes/new" className="btn-primary"><PlusCircle size={16} /> New Quiz</Link>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard icon={Users} label="Students" value={data.totalUsers} accent="primary" />
        <StatCard icon={BookOpen} label="Total Quizzes" value={data.totalQuizzes} accent="violet" />
        <StatCard icon={ClipboardCheck} label="Quiz Attempts" value={data.totalAttempts} accent="emerald" />
        <StatCard icon={TrendingUp} label="Avg. Score" value={`${data.avgScorePct}%`} accent="amber" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-display font-bold text-slate-900 mb-4">Most Popular Quizzes</h2>
          {data.quizPopularity.length === 0 ? (
            <p className="text-sm text-slate-400">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.quizPopularity} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="title" width={140} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="attempts" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-display font-bold text-slate-900 mb-4">Recent Attempts</h2>
          {data.recentAttempts.length === 0 ? (
            <p className="text-sm text-slate-400">No attempts yet.</p>
          ) : (
            <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
              {data.recentAttempts.map((a) => {
                const pct = a.totalPoints > 0 ? Math.round((a.score / a.totalPoints) * 100) : 0;
                return (
                  <div key={a.id} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2.5 last:border-0">
                    <div>
                      <p className="font-medium text-slate-800">{a.userName}</p>
                      <p className="text-xs text-slate-500">{a.quizTitle}</p>
                    </div>
                    <span className={`font-bold ${pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
