import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Hash,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import staffManagementService from '../services/staffManagementService';

const COMMON_DEPARTMENTS = [
  'Dental',
  'Cosmetology',
  'Dermatology',
  'Aesthetics & Wellness',
  'Engineering',
  'Human Resources',
  'Finance & Accounts',
  'Operations',
  'Sales & Marketing',
  'Customer Support',
  'Legal & Compliance',
  'Administration',
];

const EMPLOYMENT_TYPES = [
  'Full-Time',
  'Part-Time',
  'Contract',
  'Intern',
];

export default function StaffForm({
  onSubmit,
  isLoading = false,
  cancelPath = '/superadmin/staff-management/details',
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    department: 'Dental',
    designation: '',
    employment_type: 'Full-Time',
    joining_date: new Date().toISOString().split('T')[0],
    address: '',
    status: 'active',
  });

  const [previewCode, setPreviewCode] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch next staff code preview
    staffManagementService
      .getPreviewCode()
      .then((res) => {
        if (res.preview_code) {
          setPreviewCode(res.preview_code);
        }
      })
      .catch(() => {
        setPreviewCode('STF-XXXX');
      });
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    if (formData.mobile && formData.mobile.trim()) {
      if (
        !/^(\+?\d{1,4}[-.\s]?)?(\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}$/.test(
          formData.mobile.trim()
        ) ||
        formData.mobile.replace(/\D/g, '').length < 7
      ) {
        errs.mobile = 'Please enter a valid mobile number (min 7 digits).';
      }
    }

    if (formData.password && formData.password.length > 0 && formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const clientErrors = validate();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    try {
      await onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password ? formData.password : undefined,
        mobile: formData.mobile.trim() || null,
        department: formData.department,
        designation: formData.designation.trim() || null,
        employment_type: formData.employment_type,
        joining_date: formData.joining_date,
        address: formData.address.trim() || null,
        status: formData.status,
      });

      // Reset form on success
      setFormData({
        name: '',
        email: '',
        password: '',
        mobile: '',
        department: 'Dental',
        designation: '',
        employment_type: 'Full-Time',
        joining_date: new Date().toISOString().split('T')[0],
        address: '',
        status: 'active',
      });
      setErrors({});

      // Refresh code preview
      staffManagementService.getPreviewCode().then((res) => {
        if (res.preview_code) setPreviewCode(res.preview_code);
      });
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({
          general:
            err.response?.data?.message ||
            'Failed to create staff member. Please check details and try again.',
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* General Alert */}
      {errors.general && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-slide-up shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span className="font-medium">{errors.general}</span>
        </div>
      )}

      {/* Staff Code Preview Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-cyan-50/40 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs animate-slide-up">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-600 text-white flex items-center justify-center font-bold shrink-0 icon-3d shadow-md">
            <Hash className="w-5 h-5 drop-shadow-sm" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                Staff Code Auto-Generation
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200/60">
                <Sparkles className="w-3 h-3 animate-pulse-glow" />
                Next Available
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
              Assigned automatically by the backend upon record creation.
            </p>
          </div>
        </div>
        <div className="self-stretch sm:self-auto text-center px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 font-mono text-sm font-bold tracking-wider shadow-2xs shrink-0">
          {previewCode || 'STF-0001'}
        </div>
      </div>

      {/* SECTION 1: PERSONAL & CONTACT IDENTITY */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-200/80 transition-all duration-300 space-y-4 animate-slide-up stagger-1 group">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 via-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0 icon-3d shadow-sm group-hover:scale-105 transition-transform duration-300">
            <User className="w-4 h-4 drop-shadow-sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-mono text-[10px] font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Personal &amp; Contact Details
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., Sarah Jenkins"
                disabled={isLoading}
                required
                className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 shadow-2xs ${
                  errors.name
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/15'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{Array.isArray(errors.name) ? errors.name[0] : errors.name}</span>
              </p>
            )}
          </div>

          {/* Email Address */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="sarah.jenkins@company.com"
                disabled={isLoading}
                required
                className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 shadow-2xs ${
                  errors.email
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/15'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{Array.isArray(errors.email) ? errors.email[0] : errors.email}</span>
              </p>
            )}
          </div>

          {/* Mobile Number */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                placeholder="e.g., +91 98765 43210"
                disabled={isLoading}
                className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 shadow-2xs ${
                  errors.mobile
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/15'
                }`}
              />
            </div>
            {errors.mobile && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{Array.isArray(errors.mobile) ? errors.mobile[0] : errors.mobile}</span>
              </p>
            )}
          </div>

          {/* Login Password */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Login Password <span className="text-slate-400 font-normal lowercase">(default: 123456)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Leave blank for default (123456)"
                disabled={isLoading}
                className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 shadow-2xs ${
                  errors.password
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/15'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{Array.isArray(errors.password) ? errors.password[0] : errors.password}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: PROFESSIONAL & DEPARTMENTAL ASSIGNMENT */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-teal-200/80 transition-all duration-300 space-y-4 animate-slide-up stagger-2 group">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 via-cyan-600 to-blue-600 text-white flex items-center justify-center shrink-0 icon-3d shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Briefcase className="w-4 h-4 drop-shadow-sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 font-mono text-[10px] font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Professional &amp; Role Details
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Department */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Department
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={formData.department}
                onChange={(e) => handleChange('department', e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200 shadow-2xs cursor-pointer"
              >
                {COMMON_DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Designation */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Designation / Role
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => handleChange('designation', e.target.value)}
                placeholder="e.g., Dental Surgeon, Consultant Dermatologist"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200 shadow-2xs"
              />
            </div>
          </div>

          {/* Employment Type */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Employment Type
            </label>
            <select
              value={formData.employment_type}
              onChange={(e) => handleChange('employment_type', e.target.value)}
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200 shadow-2xs cursor-pointer"
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Joining Date */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Joining Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                value={formData.joining_date}
                onChange={(e) => handleChange('joining_date', e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200 shadow-2xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: RESIDENCE & ACCOUNT STATUS */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all duration-300 space-y-4 animate-slide-up stagger-3 group">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 via-slate-800 to-slate-900 text-white flex items-center justify-center shrink-0 icon-3d shadow-sm group-hover:scale-105 transition-transform duration-300">
            <MapPin className="w-4 h-4 drop-shadow-sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Address &amp; Operational Status
            </h3>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Work / Residential Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Floor, building, street, city, postal code..."
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200 shadow-2xs resize-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Account Status
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  formData.status === 'active'
                    ? 'border-emerald-500/50 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={formData.status === 'active'}
                  onChange={() => handleChange('status', 'active')}
                  disabled={isLoading}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 shrink-0"
                />
                <div>
                  <span className="text-xs font-bold text-emerald-800 block">Active</span>
                  <span className="text-[11px] text-slate-500">In Active Duty / Available for clinic duties</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  formData.status === 'inactive'
                    ? 'border-amber-500/50 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={formData.status === 'inactive'}
                  onChange={() => handleChange('status', 'inactive')}
                  disabled={isLoading}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500 shrink-0"
                />
                <div>
                  <span className="text-xs font-bold text-amber-800 block">Inactive</span>
                  <span className="text-[11px] text-slate-500">On Leave / Temporarily Relieved</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-5 border-t border-slate-200/80">
        <Link
          to={cancelPath}
          className="w-full sm:w-auto text-center px-6 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200 cursor-pointer shadow-2xs"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Provisioning Staff...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Save &amp; Provision Staff</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
