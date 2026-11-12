import React from 'react';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function ClinicStatusBadge({ status, size = 'sm', className = '' }) {
  const norm = (status || '').toLowerCase();

  if (norm === 'active') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs ${
          size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]'
        } ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <span>Operational</span>
      </span>
    );
  }

  if (norm === 'maintenance') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs ${
          size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]'
        } ${className}`}
      >
        <Clock className="w-3 h-3 text-amber-500 shrink-0" />
        <span>Maintenance</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 shadow-2xs ${
        size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]'
      } ${className}`}
    >
      <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />
      <span>Inactive</span>
    </span>
  );
}

