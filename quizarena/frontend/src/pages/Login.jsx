// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Target, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      const dest = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') setForm({ email: 'admin@quizarena.com', password: 'Admin@123' });
    else setForm({ email: 'aditi@student.com', password: 'Student@123' });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-primary-50/50 to-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-600 to-violet-500 items-center justify-center text-white mb-3">
            <Target size={24} />
          </Link>
          <h1 className="font-display font-extrabold text-2xl text-slate-900">Welcome back</h1>
          <p className="text-slate-500 text-sm mt-1">Log in to continue your quiz journey</p>
        </div>

        <div className="card p-7">
          {error && (
            <div className="mb-4 flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="email" required className="input pl-10" placeholder="you@college.edu"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="password" required className="input pl-10" placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-xs text-slate-400 mb-2 text-center">Quick demo access</p>
            <div className="flex gap-2">
              <button onClick={() => fillDemo('student')} className="btn-secondary flex-1 text-xs py-2">Fill Student Demo</button>
              <button onClick={() => fillDemo('admin')} className="btn-secondary flex-1 text-xs py-2">Fill Admin Demo</button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account? <Link to="/register" className="text-primary-600 font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
