import React from 'react';
import { useRouteError, useNavigate, isRouteErrorResponse } from 'react-router-dom';
import { AlertTriangle, RotateCcw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/atoms/Button';

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  let errorMessage = 'An unexpected application error occurred.';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status;
    errorMessage = error.statusText || error.data?.message || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full glass-terminal p-8 rounded-3xl border border-rose-500/30 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-white">Something Went Wrong</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            We encountered an unexpected error rendering this view. Our engineering team has been notified.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-left font-mono text-[11px] text-rose-300 break-words max-h-32 overflow-y-auto">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md shadow-lime-500/25 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reload View</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/10 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
};
