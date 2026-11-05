import React, { useState } from 'react';
import { Lock, Eye, EyeOff, KeyRound, ShieldCheck } from 'lucide-react';
import adminAuthService from '../../services/adminAuthService';
import { useToast } from '../../context/ToastContext';

export default function AdminChangePasswordPage() {
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (newPassword !== confirmPassword) {
      setErrors({ password_confirmation: ['Passwords do not match.'] });
      return;
    }

    setIsSaving(true);
    try {
      await adminAuthService.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      toast.success('Your password has been updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error(err.response?.data?.message || 'Failed to change password.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 max-w-2xl animate-fade-in font-sans min-w-0">
      {/* Header with 3D Icon */}
      <div className="flex items-center gap-3.5 pb-2 border-b border-slate-200/80">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-violet-700 text-white flex items-center justify-center shrink-0 icon-3d shadow-md shadow-indigo-500/20">
          <KeyRound className="w-6 h-6 drop-shadow-sm" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight truncate">
            Change Account Password
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-normal truncate">
            Regularly update your credentials to safeguard your privileged access.
          </p>
        </div>
      </div>

      <div className="w-full bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs hover:border-indigo-200/70 transition-all duration-300 animate-slide-up">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-display">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                required
                className={`w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 shadow-2xs ${
                  errors.current_password
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/15'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.current_password && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.current_password[0]}</p>
            )}
          </div>

          {/* New Password */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-display">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                className={`w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 shadow-2xs ${
                  errors.password
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/15'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.password[0]}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-display">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                className={`w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 shadow-2xs ${
                  errors.password_confirmation
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/15'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password_confirmation && (
              <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.password_confirmation[0]}</p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50 font-display"
            >
              {isSaving ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
