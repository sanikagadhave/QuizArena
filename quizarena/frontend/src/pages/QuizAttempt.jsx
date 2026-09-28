// src/pages/QuizAttempt.jsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizApi, attemptApi } from '../api';
import Timer from '../components/Timer';
import QuestionNav, { ProgressBar } from '../components/QuestionNav';
import { DifficultyBadge, CategoryBadge } from '../components/Badges';
import { Clock, HelpCircle, Play, ChevronLeft, ChevronRight, Flag, Loader2 } from 'lucide-react';

export default function QuizAttempt() {
  const { id: quizId } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('loading'); // loading | intro | taking | submitting
  const [quiz, setQuiz] = useState(null);
  const [session, setSession] = useState(null); // { attempt, quiz, questions }
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({}); // questionId -> option
  const [deadline, setDeadline] = useState(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    quizApi.get(quizId).then((q) => { setQuiz(q); setPhase('intro'); }).catch(() => navigate('/browse'));
  }, [quizId, navigate]);

  const handleStart = async () => {
    setPhase('loading');
    try {
      const data = await attemptApi.start(quizId);
      const startedAtMs = new Date(data.attempt.startedAt.replace(' ', 'T') + 'Z').getTime();
      setDeadline(startedAtMs + data.quiz.durationMinutes * 60 * 1000);
      setSession(data);
      setPhase('taking');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not start quiz.');
      setPhase('intro');
    }
  };

  const submit = useCallback(async (auto = false) => {
    if (submittedRef.current || !session) return;
    submittedRef.current = true;
    setPhase('submitting');
    const payload = Object.entries(answers).map(([questionId, selectedOption]) => ({ questionId, selectedOption }));
    try {
      const fn = auto ? attemptApi.autoSubmit : attemptApi.submit;
      await fn(session.attempt.id, payload);
      navigate(`/results/${session.attempt.id}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed.');
      submittedRef.current = false;
      setPhase('taking');
    }
  }, [answers, session, navigate]);

  const handleExpire = useCallback(() => submit(true), [submit]);

  if (phase === 'loading' || !quiz) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="card p-8 text-center">
          <div className="flex justify-center gap-2 mb-4">
            <CategoryBadge category={quiz.category} />
            <DifficultyBadge difficulty={quiz.difficulty} />
          </div>
          <h1 className="font-display font-extrabold text-3xl text-slate-900">{quiz.title}</h1>
          <p className="text-slate-500 mt-3">{quiz.description}</p>

          <div className="grid grid-cols-2 gap-4 my-8">
            <div className="rounded-xl bg-slate-50 p-4">
              <Clock className="mx-auto text-primary-500 mb-1" size={22} />
              <p className="font-bold text-slate-800">{quiz.durationMinutes} minutes</p>
              <p className="text-xs text-slate-500">Time limit</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <HelpCircle className="mx-auto text-primary-500 mb-1" size={22} />
              <p className="font-bold text-slate-800">{quiz.questions.length} questions</p>
              <p className="text-xs text-slate-500">Multiple choice</p>
            </div>
          </div>

          <ul className="text-left text-sm text-slate-500 space-y-1.5 mb-8 bg-amber-50/60 border border-amber-100 rounded-xl p-4">
            <li>• Once started, the timer cannot be paused.</li>
            <li>• The quiz auto-submits automatically when time runs out.</li>
            <li>• You can navigate between questions freely before submitting.</li>
          </ul>

          <button onClick={handleStart} className="btn-primary text-base px-8 py-3 mx-auto">
            <Play size={18} /> Start Quiz
          </button>
        </div>
      </div>
    );
  }

  // phase === taking or submitting
  const questions = session.questions;
  const q = questions[current];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="font-display font-bold text-xl text-slate-900">{session.quiz.title}</h1>
          <p className="text-sm text-slate-500">Question {current + 1} of {questions.length} · {answeredCount} answered</p>
        </div>
        <Timer deadline={deadline} onExpire={handleExpire} />
      </div>

      <ProgressBar current={current} total={questions.length} />

      <div className="card p-6 sm:p-8 my-6 animate-fade-in" key={q.id}>
        <p className="text-xs font-semibold text-primary-600 mb-2">QUESTION {current + 1}</p>
        <h2 className="font-display font-bold text-xl text-slate-900 leading-snug mb-6">{q.questionText}</h2>
        <div className="space-y-3">
          {['a', 'b', 'c', 'd'].map((opt) => {
            const selected = answers[q.id] === opt;
            return (
              <button
                key={opt}
                onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${
                  selected ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  selected ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {opt.toUpperCase()}
                </span>
                <span className="text-slate-700">{q.options[opt]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card p-4 mb-6">
        <p className="text-xs font-semibold text-slate-500 mb-3">JUMP TO QUESTION</p>
        <QuestionNav questions={questions} current={current} answers={answers} onJump={setCurrent} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          disabled={current === 0}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          className="btn-secondary"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent((c) => c + 1)} className="btn-primary">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={() => submit(false)} disabled={phase === 'submitting'} className="btn-primary bg-emerald-600 hover:bg-emerald-700">
            {phase === 'submitting' ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : <><Flag size={16} /> Submit Quiz</>}
          </button>
        )}
      </div>
    </div>
  );
}
