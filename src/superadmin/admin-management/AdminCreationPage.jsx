import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Shield, ChevronRight } from 'lucide-react';
import AdminForm from './AdminForm';
import adminManagementService from '../services/adminManagementService';
import { useToast } from '../../context/ToastContext';

export default function AdminCreationPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAdmin = async (data) => {
    setIsLoading(true);
    try {
      const response = await adminManagementService.createAdmin(data);
      toast.success(`Admin account '${data.name}' provisioned successfully.`);
      navigate('/superadmin/admin-management/details');
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap py-0.5">
        <Link to="/superadmin/dashboard" className="hover:text-slate-900 transition-colors">
          Superadmin
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link to="/superadmin/admin-management/details" className="text-slate-600 hover:text-slate-900 transition-colors">
          Admin Management
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-blue-600 font-semibold">Admin Creation</span>
      </nav>

      {/* Page Title & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shrink-0 icon-3d shadow-md hover:scale-105 transition-all duration-300">
              <UserPlus className="w-5 h-5 drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold font-display text-slate-900 tracking-tight">
                Create Admin Account
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Provision a new operational administrator account in the dedicated <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded text-[11px]">admins</code> table.
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/superadmin/admin-management/details"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 hover:border-slate-300 border border-slate-200/90 rounded-xl transition-all shadow-2xs hover:shadow-xs self-stretch sm:self-auto cursor-pointer group shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>View Admin Details</span>
        </Link>
      </div>

      {/* Main Form Card (col-12 full width) */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 lg:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-blue-50/50 via-indigo-50/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10">
          <AdminForm
            onSubmit={handleCreateAdmin}
            isLoading={isLoading}
            cancelPath="/superadmin/admin-management/details"
          />
        </div>
      </div>

      {/* Multi-Panel Isolation Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 to-indigo-50/60 border border-blue-200/80 flex items-start gap-3.5 text-xs text-blue-900 shadow-2xs">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 icon-3d shadow-sm mt-0.5">
          <Shield className="w-4 h-4 drop-shadow-sm" />
        </div>
        <div className="leading-relaxed">
          <span className="font-bold block text-sm text-blue-950">Account Privilege Notice</span>
          Admins created here are assigned to Panel 2 (Operational Tier). They do not possess Superadmin rights and are strictly restricted from accessing executive Superadmin endpoints.
        </div>
      </div>
    </div>
  );
}
