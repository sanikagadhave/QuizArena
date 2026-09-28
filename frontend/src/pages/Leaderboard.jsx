// src/pages/Leaderboard.jsx
import { useEffect, useState } from 'react';
import { leaderboardApi, quizApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Loader2 } from 'lucide-react';

const RANK_STYLES = {
  1: 'bg-amber-400 text-white',
  2: 'bg-slate-300 text-white',
  3: 'bg-orange-400 text-white',
};

function RankBadge({ rank }) {
  if (rank <= 3) {
    return (
      <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${RANK_STYLES[rank]}`}>
        {rank}
      </span>
    );
  }
  return <span className="h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm bg-slate-100 text-slate-500">{rank}</span>;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [quizId, setQuizId] = useState('global');
  const [rows, setRows] = useState(null);

  useEffect(() => { quizApi.list({}).then(setQuizzes); }, []);

  useEffect(() => {
    setRows(null);
    const fetcher = quizId === 'global' ? leaderboardApi.global() : leaderboardApi.forQuiz(quizId);
    fetcher.then(setRows);
  }, [quizId]);

  // Light polling so the leaderboard feels "live" without needing websockets
  useEffect(() => {
    const interval = setInterval(() => {
      const fetcher = quizId === 'global' ? leaderboardApi.global() : leaderboardApi.forQuiz(quizId);
      fetcher.then(setRows);
    }, 15000);
    return () => clearInterval(interval);
  }, [quizId]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-slate-900 flex items-center gap-2">
            <Trophy className="text-amber-500" /> Leaderboard
          </h1>
          <p className="text-slate-500 mt-1">Rankings update automatically every 15 seconds.</p>
        </div>
        <select className="input w-56" value={quizId} onChange={(e) => setQuizId(e.target.value)}>
          <option value="global">🌍 Global Rankings</option>
          {quizzes.map(q => <option key={q.id} value={q.id}>{q.title}</option>)}
        </select>
      </div>

      {!rows ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-primary-500" size={28} /></div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20">
          <Medal size={40} className="mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">No attempts yet for this leaderboard.</p>
        </div>
      ) : (
        <div className="card divide-y divide-slate-100 overflow-hidden">
          {rows.map((r) => (
            <div
              key={r.userId}
              className={`flex items-center gap-4 px-5 py-4 ${r.userId === user?.id ? 'bg-primary-50/60' : ''}`}
            >
              <RankBadge rank={r.rank} />
              <span
                className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: r.avatarColor }}
              >
                {r.userName?.[0]?.toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 truncate">
                  {r.userName} {r.userId === user?.id && <span className="text-xs text-primary-600">(You)</span>}
                </p>
                {quizId === 'global' ? (
                  <p className="text-xs text-slate-500">{r.quizzesPlayed} quizzes played · {r.avgPct}% avg</p>
                ) : (
                  <p className="text-xs text-slate-500">{r.timeTakenSeconds ? `${r.timeTakenSeconds}s` : '—'}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-display font-extrabold text-lg text-slate-900">
                  {quizId === 'global' ? r.totalScore : `${r.percentage}%`}
                </p>
                <p className="text-xs text-slate-400">{quizId === 'global' ? 'total points' : `${r.score}/${r.totalPoints}`}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
