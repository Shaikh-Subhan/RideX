import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center text-rx-main">
      <div className="w-16 h-16 rounded-3xl bg-rx-card border border-rx-border flex items-center justify-center text-rx-accent mb-6 shadow-xl">
        <Car className="w-8 h-8" />
      </div>
      <span className="text-xs font-extrabold text-rx-accent uppercase tracking-widest">
        404 Not Found
      </span>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-rx-main tracking-tight mt-2 mb-3">
        Page Not Found
      </h1>
      <p className="text-xs sm:text-sm text-rx-muted max-w-md mb-8 leading-relaxed">
        The road you're looking for doesn't exist or has taken a detour. Let's get you back on track.
      </p>

      <div className="flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rx-accent hover:bg-rx-accent-hover text-rx-on-accent font-bold text-xs shadow-md transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          to="/cars"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rx-card hover:bg-rx-surface text-rx-muted border border-rx-border font-bold text-xs transition-all"
        >
          <span>Explore Cars</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
