// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <p className="font-display font-extrabold text-7xl text-primary-100">404</p>
      <h1 className="font-display font-bold text-2xl text-slate-800 mt-2">Page not found</h1>
      <p className="text-slate-500 mt-2 mb-6">The page you're looking for doesn't exist or has moved.</p>
      <Link to="/" className="btn-primary"><Home size={16} /> Back to Home</Link>
    </div>
  );
}
