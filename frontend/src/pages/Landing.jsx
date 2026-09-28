// src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Timer, BarChart3, ShieldCheck, ArrowRight, Sparkles, Users, BookOpen } from 'lucide-react';

const FEATURES = [
  { icon: Timer, title: 'Timed Challenges', desc: 'Race the clock with auto-submit so every quiz stays fair and fast-paced.' },
  { icon: BarChart3, title: 'Instant Scoring', desc: 'Get graded the moment you submit, with a full answer-by-answer review.' },
  { icon: Trophy, title: 'Live Leaderboards', desc: 'Climb per-quiz and global rankings as you compete with classmates.' },
  { icon: ShieldCheck, title: 'Secure & Role-Based', desc: 'JWT-secured accounts with dedicated Student and Admin experiences.' },
];

const STATS = [
  { icon: BookOpen, value: '8+', label: 'Sample Quizzes' },
  { icon: Users, value: '2', label: 'Roles Supported' },
  { icon: Sparkles, value: '100%', label: 'Auto-Graded' },
];

export default function Landing() {
  const { user } = useAuth();
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 sm:py-28 text-center">
          <span className="inline-flex items-center gap-1.5 badge bg-white border border-primary-100 text-primary-700 shadow-sm mb-6">
            <Sparkles size={14} /> The modern way to quiz
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-slate-900 leading-tight">
            Compete. Learn. <span className="bg-gradient-to-r from-primary-600 to-violet-500 bg-clip-text text-transparent">Win.</span>
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-2xl mx-auto">
            QuizArena is a timed, auto-graded quiz platform for students - browse quizzes by category and difficulty,
            race the clock, and climb the live leaderboard.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-base px-7 py-3">Go to Dashboard <ArrowRight size={18} /></Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base px-7 py-3">Create Free Account <ArrowRight size={18} /></Link>
                <Link to="/login" className="btn-secondary text-base px-7 py-3">Log In</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="max-w-5xl mx-auto px-6 -mt-6 relative">
        <div className="card grid grid-cols-3 divide-x divide-slate-100 p-6">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-2">
              <Icon size={20} className="text-primary-500 mb-1" />
              <p className="font-display font-extrabold text-2xl text-slate-900">{value}</p>
              <p className="text-xs text-slate-500 text-center">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-display font-extrabold text-3xl text-slate-900">Everything you need to run a quiz</h2>
          <p className="text-slate-500 mt-2">From taking a quiz to tracking your progress over time.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-6 hover:shadow-md transition-shadow">
              <div className="h-11 w-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                <Icon size={22} />
              </div>
              <h3 className="font-display font-bold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-500 mt-1.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="max-w-5xl mx-auto px-6 pb-20">
          <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-violet-600 px-8 py-14 text-center text-white overflow-hidden relative">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl">Ready to test your knowledge?</h2>
            <p className="mt-3 text-primary-100 max-w-lg mx-auto">Sign up in seconds and jump straight into a quiz - no setup required.</p>
            <Link to="/register" className="btn-primary bg-white text-primary-700 hover:bg-primary-50 mt-7 inline-flex text-base px-7 py-3">
              Get Started Free <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
