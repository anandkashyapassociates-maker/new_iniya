import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordForm({
  role = 'admin',
  onSubmit,
  isLoading = false,
  loginPath = '/',
}) {
  const isSuperAdmin = role === 'superadmin';
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please provide your email address.');
      return;
    }

    try {
      const response = await onSubmit({ email });
      setSubmitted(true);
      if (response?.dev_reset_token) {
        setDevToken(response.dev_reset_token);
      }
    } catch (err) {
      if (err.response?.data?.errors?.email) {
        setError(err.response.data.errors.email[0]);
      } else {
        setError(err.response?.data?.message || 'Failed to submit recovery request.');
      }
    }
  };

  if (submitted) {
    const tokenParam = devToken || 'local-reset';
    const resetUrl = isSuperAdmin 
      ? `/superadmin/reset-password?token=${tokenParam}&email=${encodeURIComponent(email)}`
      : `/admin/reset-password?token=${tokenParam}&email=${encodeURIComponent(email)}`;

    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-950/60 border-2 border-emerald-500/60 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-7 h-7" />
        </div>

        <h3 className="text-base font-semibold text-white font-display">Password Reset Ready</h3>

        <p className="text-xs text-slate-300 leading-relaxed font-normal">
          Reset authorization generated for <span className="font-semibold text-white font-mono">{email}</span>. You can now immediately set a new secure password.
        </p>

        <div className="pt-2 space-y-3">
          <Link
            to={resetUrl}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer font-display"
          >
            <span>Click Here to Set New Password</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <div>
            <Link
              to={loginPath}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors font-display"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Login</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs font-medium leading-relaxed">
          {error}
        </div>
      )}

      <p className="text-xs text-slate-300 leading-relaxed font-normal">
        Enter your administrative email address. We will verify your account and send a secure password reset link.
      </p>

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-display">
          Email Address
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={isSuperAdmin ? 'superadmin@example.com' : 'admin@example.com'}
            disabled={isLoading}
            required
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950 text-white border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-xl text-xs font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 font-display ${
          isSuperAdmin
            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 shadow-purple-900/30'
            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 shadow-blue-900/30'
        }`}
      >
        {isLoading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span>Send Reset Instructions</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>

      <div className="text-center pt-2">
        <Link
          to={loginPath}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Login</span>
        </Link>
      </div>
    </form>
  );
}
