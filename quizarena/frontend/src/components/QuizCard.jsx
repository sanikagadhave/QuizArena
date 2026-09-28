// src/components/QuizCard.jsx
import { useNavigate } from 'react-router-dom';
import { Clock, HelpCircle, ArrowRight } from 'lucide-react';
import { DifficultyBadge, CategoryBadge } from './Badges';

const GRADIENTS = [
  'from-indigo-500 to-violet-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
  'from-sky-500 to-blue-500',
];

function gradientFor(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export default function QuizCard({ quiz }) {
  const navigate = useNavigate();
  return (
    <div className="card overflow-hidden flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 animate-slide-up">
      <div className={`h-24 bg-gradient-to-br ${gradientFor(quiz.id)} flex items-end p-4`}>
        <div className="flex gap-2">
          <DifficultyBadge difficulty={quiz.difficulty} />
        </div>
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <CategoryBadge category={quiz.category} />
          <h3 className="mt-2 font-display font-bold text-lg text-slate-900 leading-snug">{quiz.title}</h3>
          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{quiz.description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Clock size={14} /> {quiz.durationMinutes} min</span>
            <span className="flex items-center gap-1"><HelpCircle size={14} /> {quiz.questionCount} Qs</span>
          </div>
          <button onClick={() => navigate(`/quiz/${quiz.id}`)} className="btn-ghost text-primary-600 font-semibold">
            Start <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
