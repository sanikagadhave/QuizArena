// src/components/Footer.jsx
import { Target } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-display font-bold text-slate-800">
          <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-primary-600 to-violet-500 flex items-center justify-center text-white">
            <Target size={14} />
          </span>
          QuizArena
        </div>
        <p className="text-sm text-slate-400">Built as a college project - compete, learn, and climb the leaderboard.</p>
      </div>
    </footer>
  );
}
