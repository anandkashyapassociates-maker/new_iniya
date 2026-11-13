import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Save,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  Key,
} from 'lucide-react';
import { useSuperAdminAuth } from '../../superadmin/auth/SuperAdminAuthContext';
import superAdminAuthService from '../../superadmin/auth/superAdminAuthService';
import { useToast } from '../../context/ToastContext';

export default function SuperAdminProfilePage() {
  const { user, updateUser } = useSuperAdminAuth();
  const toast = useToast();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileErrors, setProfileErrors] = useState({});

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Sync state when user profile is loaded or updated
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileErrors({});
    setProfileSaving(true);

    try {
      const res = await superAdminAuthService.updateProfile({ name, email });
      if (res?.user) {
        updateUser(res.user);
      }
      toast.success(res?.message || 'Super Admin profile updated successfully.');
    } catch (err) {
      if (err.response?.data?.errors) {
        setProfileErrors(err.response.data.errors);
      } else {
        toast.error(err.response?.data?.message || 'Failed to update profile.');
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordErrors({});

    if (newPassword.length < 8) {
      setPasswordErrors({ password: ['Password must be at least 8 characters.'] });
      toast.error('Password must be at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordErrors({ password_confirmation: ['Passwords do not match.'] });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await superAdminAuthService.changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      toast.success(res?.message || 'Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err.response?.data?.errors) {
        setPasswordErrors(err.response.data.errors);
      } else {
        toast.error(err.response?.data?.message || 'Failed to change password.');
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-8 min-w-0">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link to="/superadmin/dashboard" className="hover:text-blue-600 transition-colors">
          Superadmin
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-blue-600 font-semibold">Profile &amp; Security</span>
      </nav>

      {/* Page Title & Description with 3D Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 animate-fade-in">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-400 text-white flex items-center justify-center shrink-0 icon-3d shadow-md shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 drop-shadow-sm" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
              Profile &amp; Security Settings
              <span className="text-[11px] font-semibold font-mono px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Root Clearance
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your executive root account credentials, personal contact, and encryption secrets.
            </p>
          </div>
        </div>
      </div>

      {/* Account Identity Card (Elevated 3D Banner) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 sm:p-7 rounded-3xl border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl animate-slide-up stagger-1">
        {/* Ambient decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 text-white flex items-center justify-center text-2xl font-bold shadow-lg icon-3d shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg font-bold text-white truncate">{user?.name || 'Super Administrator'}</h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Root Executive
              </span>
            </div>
            <p className="text-xs text-slate-300 font-mono mt-1 truncate">{user?.email || 'superadmin@example.com'}</p>
          </div>
        </div>

        <div className="relative text-xs text-slate-300 space-y-2 md:text-right border-t md:border-t-0 border-slate-800/80 pt-4 md:pt-0 shrink-0">
          <div className="flex items-center md:justify-end gap-2">
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-400">Account Created:</span>
            <span className="text-white font-medium">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active System'}
            </span>
          </div>
          <div className="flex items-center md:justify-end gap-2">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Session Status:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Verified Active
            </span>
          </div>
        </div>
      </div>

      {/* 2-Column Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
        {/* Profile Information Form */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:border-blue-200/80 transition-all duration-300 flex flex-col justify-between animate-slide-up stagger-2 group">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-indigo-700 text-white flex items-center justify-center shrink-0 icon-3d shadow-sm group-hover:scale-105 transition-transform duration-300">
                <User className="w-5 h-5 drop-shadow-sm" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Personal Information
                </h3>
                <p className="text-xs text-slate-500">Update your executive name &amp; email identity</p>
              </div>
            </div>

            <form id="profile-form" onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Display Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Super Administrator"
                    className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                      profileErrors.name
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/15'
                    }`}
                  />
                </div>
                {profileErrors.name && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">
                    {profileErrors.name[0]}
                  </p>
                )}
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="superadmin@iniya.com"
                    className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                      profileErrors.email
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/15'
                    }`}
                  />
                </div>
                {profileErrors.email && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">
                    {profileErrors.email[0]}
                  </p>
                )}
              </div>

              {/* Informational callout */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  Changing your root email will update where system alerts, database snapshots, and critical incident logs are delivered.
                </p>
              </div>
            </form>
          </div>

          <div className="pt-5 mt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              form="profile-form"
              disabled={profileSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {profileSaving ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{profileSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs hover:border-indigo-200/80 transition-all duration-300 flex flex-col justify-between animate-slide-up stagger-3 group">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-indigo-700 text-white flex items-center justify-center shrink-0 icon-3d shadow-sm group-hover:scale-105 transition-transform duration-300">
                <Key className="w-5 h-5 drop-shadow-sm" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Security &amp; Password
                </h3>
                <p className="text-xs text-slate-500">Rotate master password for root clearance</p>
              </div>
            </div>

            <form id="password-form" onSubmit={handleChangePassword} className="space-y-4">
              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Current Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 text-slate-900 font-medium transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {passwordErrors.current_password && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">
                    {passwordErrors.current_password[0]}
                  </p>
                )}
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 text-slate-900 font-medium transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                {passwordErrors.password && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">
                    {passwordErrors.password[0]}
                  </p>
                )}
              </div>

              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm New Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-500 text-slate-900 font-medium transition-all duration-200"
                  />
                </div>
                {passwordErrors.password_confirmation && (
                  <p className="text-[11px] text-rose-500 font-medium mt-1">
                    {passwordErrors.password_confirmation[0]}
                  </p>
                )}
              </div>
            </form>
          </div>

          <div className="pt-5 mt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              form="password-form"
              disabled={passwordSaving}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {passwordSaving ? (
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Lock className="w-3.5 h-3.5" />
              )}
              <span>{passwordSaving ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
