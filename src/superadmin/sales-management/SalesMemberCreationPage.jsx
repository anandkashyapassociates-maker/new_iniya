import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, ChevronRight, ArrowLeft } from 'lucide-react';
import SalesMemberForm from './SalesMemberForm';
import salesMemberManagementService from '../services/salesMemberManagementService';
import { useToast } from '../../context/ToastContext';

export default function SalesMemberCreationPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSalesMemberSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await salesMemberManagementService.createSalesMember(formData);
      const memberCode = response.sales_member?.sales_code || '';
      const memberName = response.sales_member?.name || 'Sales Member';
      toast.success(
        `Sales Member '${memberName}' (${memberCode}) provisioned successfully!`
      );
      navigate('/superadmin/sales-members');
    } finally {
      setIsSubmitting(false);
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
        <Link to="/superadmin/sales-members" className="text-slate-600 hover:text-slate-900 transition-colors">
          Sales Team Management
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-blue-600 font-semibold">Sales Member Creation</span>
      </nav>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-600 to-purple-700 text-white flex items-center justify-center shrink-0 icon-3d shadow-md hover:scale-105 transition-all duration-300">
              <TrendingUp className="w-5 h-5 drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold font-display text-slate-900 tracking-tight">
                Create Sales Member Profile
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Provision authorized sales representatives into the dedicated <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded text-[11px]">sales_members</code> table. Codes (<code className="font-mono text-purple-600 font-semibold text-[11px]">SAL-XXXX</code>) are generated automatically.
              </p>
            </div>
          </div>
        </div>

        <Link
          to="/superadmin/sales-members"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer self-stretch sm:self-auto shrink-0 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Sales Directory</span>
        </Link>
      </div>

      {/* Form Card */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 lg:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-50/50 via-indigo-50/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10">
          <SalesMemberForm onSubmit={handleSalesMemberSubmit} isLoading={isSubmitting} cancelPath="/superadmin/sales-members" />
        </div>
      </div>
    </div>
  );
}
