import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Shield,
  KeyRound,
  Building2,
  Compass,
  Globe,
  MapPin,
  PlusCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import clinicManagementService from '../services/clinicManagementService';

export default function AdminForm({
  onSubmit,
  isLoading = false,
  cancelPath = '/superadmin/admin-management/details',
}) {
  const [formData, setFormData] = useState({
    clinic_id: '',
    name: '',
    email: '',
    mobile: '',
    password: '',
    password_confirmation: '',
    is_active: true,
  });

  const [clinics, setClinics] = useState([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    let isMounted = true;
    const loadClinics = async () => {
      setIsLoadingClinics(true);
      try {
        const res = await clinicManagementService.getClinicOptions({ unassigned_admin_only: 1 });
        const rawList = res?.clinics || (Array.isArray(res) ? res : []);
        // Enforce 1 Admin per Clinic: only show clinics without an assigned admin
        const list = rawList.filter((c) => !c.admins_count || Number(c.admins_count) === 0);
        if (isMounted) {
          setClinics(list);
          if (list.length === 1) {
            setFormData((prev) => ({ ...prev, clinic_id: String(list[0].id) }));
          }
        }
      } catch (err) {
        console.error('Failed to load clinic options:', err);
      } finally {
        if (isMounted) setIsLoadingClinics(false);
      }
    };

    loadClinics();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedClinic = clinics.find(
    (c) => String(c.id) === String(formData.clinic_id)
  );

  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = calculateStrength(formData.password);

  const validateFrontend = () => {
    const newErrors = {};

    if (!formData.clinic_id) {
      newErrors.clinic_id = 'Please select a clinic branch for this administrator.';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email format (e.g., admin@company.com).';
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required.';
    } else if (
      !/^(\+?\d{1,4}[-.\s]?)?(\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}$/.test(
        formData.mobile.trim()
      ) ||
      formData.mobile.replace(/\D/g, '').length < 7
    ) {
      newErrors.mobile = 'Please enter a valid mobile number (min 7 digits).';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long.';
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Please confirm the password.';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const clientErrors = validateFrontend();
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    try {
      await onSubmit({
        clinic_id: parseInt(formData.clinic_id, 10),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        is_active: formData.is_active,
      });

      // Reset form on success (preserve clinic if only 1 exists)
      setFormData({
        clinic_id: clinics.length === 1 ? String(clinics[0].id) : '',
        name: '',
        email: '',
        mobile: '',
        password: '',
        password_confirmation: '',
        is_active: true,
      });
      setErrors({});
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setErrors({ general: err.response.data.message });
      } else {
        setErrors({
          general: 'Failed to create admin account. Please check your network and try again.',
        });
      }
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* General Server Error Banner */}
      {errors.general && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2.5 animate-slide-up shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errors.general}</span>
        </div>
      )}

      {/* STEP 1: PRIMARY REQUIREMENT - SELECT CLINIC BRANCH */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-blue-500/30 shadow-md hover:border-blue-500/50 transition-all duration-300 space-y-4 animate-slide-up group">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shrink-0 icon-3d shadow-md group-hover:scale-105 transition-transform duration-300">
              <Building2 className="w-5 h-5 drop-shadow-sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[10px] font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Clinic Branch Assignment
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 uppercase">
                  Step 1 (Mandatory)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                First select which clinic branch this operational administrator will oversee and manage. Clinic details will load automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Clinic Dropdown Selector or All Assigned Alert */}
        {!isLoadingClinics && clinics.length === 0 ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 text-xs sm:text-sm">
                  All registered clinics already have an assigned administrator
                </p>
                <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                  Every clinic branch operates under 1 dedicated administrator (1 Clinic = 1 Admin rule). To provision another administrator account, please create a new clinic branch first.
                </p>
              </div>
            </div>
            <Link
              to="/superadmin/clinics/create"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create New Clinic</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label htmlFor="admin-clinic" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Clinic Branch <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                id="admin-clinic"
                value={formData.clinic_id}
                onChange={(e) => handleChange('clinic_id', e.target.value)}
                disabled={isLoading || isLoadingClinics}
                required
                className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 shadow-2xs cursor-pointer font-medium ${
                  errors.clinic_id
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/15'
                }`}
              >
                <option value="">
                  {isLoadingClinics ? 'Loading available clinics...' : '-- Choose Clinic Branch (1 Admin per Clinic) --'}
                </option>
                {clinics.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.clinic_code}) {c.branch_name ? `— ${c.branch_name}` : ''} [Location: {c.location}]
                  </option>
                ))}
              </select>
            </div>
            {errors.clinic_id && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{Array.isArray(errors.clinic_id) ? errors.clinic_id[0] : errors.clinic_id}</span>
              </p>
            )}
          </div>
        )}

        {/* Selected Clinic Details Auto-Preview Card */}
        {selectedClinic ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-200/80 space-y-3.5 animate-scale-up">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-2.5 border-b border-blue-200/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-blue-900">
                  Assigned Clinic Profile Loaded
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white text-blue-700 border border-blue-200 shadow-2xs">
                <Lock className="w-3 h-3" />
                {selectedClinic.clinic_code}
              </span>
            </div>

            {/* Read-only populated info inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* Clinic Name & Branch */}
              <div className="min-w-0">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Clinic / Branch Name
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={`${selectedClinic.name} ${selectedClinic.branch_name ? `(${selectedClinic.branch_name})` : ''}`}
                  className="w-full px-3 py-2 text-xs bg-white/90 border border-blue-200/80 rounded-xl text-slate-800 font-semibold cursor-not-allowed shadow-2xs"
                />
              </div>

              {/* Location / Area */}
              <div className="min-w-0">
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Compass className="w-3 h-3 text-blue-500" />
                  <span>Location / Area</span>
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={selectedClinic.location || '—'}
                  className="w-full px-3 py-2 text-xs bg-white/90 border border-blue-200/80 rounded-xl text-slate-800 font-medium cursor-not-allowed shadow-2xs"
                />
              </div>

              {/* City / State */}
              <div className="min-w-0">
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-blue-500" />
                  <span>City / State</span>
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={`${selectedClinic.city || '—'}, ${selectedClinic.state || '—'} ${selectedClinic.postal_code ? `(${selectedClinic.postal_code})` : ''}`}
                  className="w-full px-3 py-2 text-xs bg-white/90 border border-blue-200/80 rounded-xl text-slate-800 font-medium cursor-not-allowed shadow-2xs"
                />
              </div>

              {/* Full Physical Address */}
              <div className="min-w-0 sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-500" />
                  <span>Full Clinic Address</span>
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={selectedClinic.address || '—'}
                  className="w-full px-3 py-2 text-xs bg-white/90 border border-blue-200/80 rounded-xl text-slate-800 font-medium cursor-not-allowed shadow-2xs"
                />
              </div>

              {/* Clinic Phone */}
              <div className="min-w-0">
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-blue-500" />
                  <span>Clinic Contact Phone</span>
                </label>
                <input
                  type="text"
                  readOnly
                  disabled
                  value={selectedClinic.phone || '—'}
                  className="w-full px-3 py-2 text-xs bg-white/90 border border-blue-200/80 rounded-xl text-slate-800 font-mono cursor-not-allowed shadow-2xs"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Placeholder guidance */
          <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
            Please choose a clinic branch above to view its physical location and address details before creating an administrator account.
          </div>
        )}
      </div>

      {/* STEP 2: ADMIN PROFILE & CONTACT */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-200/80 transition-all duration-300 space-y-4 animate-slide-up stagger-1 group">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shrink-0 icon-3d shadow-sm group-hover:scale-105 transition-transform duration-300">
            <User className="w-4 h-4 drop-shadow-sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[10px] font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Admin Profile &amp; Contact
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="md:col-span-2 min-w-0">
            <label htmlFor="admin-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-name"
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Rajesh Kumar"
                disabled={isLoading}
                required
                className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 shadow-2xs ${
                  errors.name
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/15'
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
            <label htmlFor="admin-email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="admin@company.com"
                disabled={isLoading}
                required
                className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 shadow-2xs ${
                  errors.email
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/15'
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
            <label htmlFor="admin-mobile" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) => handleChange('mobile', e.target.value)}
                placeholder="+91 98765 43210"
                disabled={isLoading}
                required
                className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 shadow-2xs ${
                  errors.mobile
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/15'
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
        </div>
      </div>

      {/* STEP 3: ACCESS & SECURITY CREDENTIALS */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-indigo-200/80 transition-all duration-300 space-y-4 animate-slide-up stagger-2 group">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-center shrink-0 icon-3d shadow-sm group-hover:scale-105 transition-transform duration-300">
            <KeyRound className="w-4 h-4 drop-shadow-sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Security &amp; Credentials
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Password */}
          <div className="min-w-0">
            <label htmlFor="admin-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Initial Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Minimum 8 characters"
                disabled={isLoading}
                required
                className={`w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 shadow-2xs ${
                  errors.password
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/15'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{Array.isArray(errors.password) ? errors.password[0] : errors.password}</span>
              </p>
            )}

            {/* Strength Meter */}
            {formData.password && (
              <div className="mt-2 space-y-1 animate-fade-in">
                <div className="flex gap-1.5 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength >= 1 ? 'w-1/4 bg-rose-500' : 'w-0'}`} />
                  <div className={`h-full rounded-full transition-all duration-300 ${strength >= 2 ? 'w-1/4 bg-amber-500' : 'w-0'}`} />
                  <div className={`h-full rounded-full transition-all duration-300 ${strength >= 3 ? 'w-1/4 bg-blue-500' : 'w-0'}`} />
                  <div className={`h-full rounded-full transition-all duration-300 ${strength >= 4 ? 'w-1/4 bg-emerald-500' : 'w-0'}`} />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 px-0.5">
                  <span>Password Complexity</span>
                  <span className={`font-bold ${strength <= 1 ? 'text-rose-600' : strength === 2 ? 'text-amber-600' : strength === 3 ? 'text-blue-600' : 'text-emerald-600'}`}>
                    {strength <= 1 ? 'Weak' : strength === 2 ? 'Moderate' : strength === 3 ? 'Strong' : 'Very Strong'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="min-w-0">
            <label htmlFor="admin-password-confirmation" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="admin-password-confirmation"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.password_confirmation}
                onChange={(e) => handleChange('password_confirmation', e.target.value)}
                placeholder="Re-enter matching password"
                disabled={isLoading}
                required
                className={`w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 shadow-2xs ${
                  errors.password_confirmation
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/15'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex={-1}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password_confirmation && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{Array.isArray(errors.password_confirmation) ? errors.password_confirmation[0] : errors.password_confirmation}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* STEP 4: ACCOUNT STATUS */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all duration-300 space-y-4 animate-slide-up stagger-3 group">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 via-slate-800 to-slate-900 text-white flex items-center justify-center shrink-0 icon-3d shadow-sm group-hover:scale-105 transition-transform duration-300">
            <CheckCircle2 className="w-4 h-4 drop-shadow-sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center">
              4
            </span>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Account Status &amp; Activation
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
              formData.is_active === true
                ? 'border-blue-500/50 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
            }`}
          >
            <input
              type="radio"
              name="is_active"
              checked={formData.is_active === true}
              onChange={() => handleChange('is_active', true)}
              disabled={isLoading}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 shrink-0"
            />
            <div>
              <span className="text-xs font-bold text-blue-900 block">Active Status</span>
              <span className="text-[11px] text-slate-500">Authorized to log into Panel 2 (Clinic Portal)</span>
            </div>
          </label>

          <label
            className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
              formData.is_active === false
                ? 'border-amber-500/50 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-xs'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
            }`}
          >
            <input
              type="radio"
              name="is_active"
              checked={formData.is_active === false}
              onChange={() => handleChange('is_active', false)}
              disabled={isLoading}
              className="w-4 h-4 text-amber-600 focus:ring-amber-500 shrink-0"
            />
            <div>
              <span className="text-xs font-bold text-amber-900 block">Inactive Status</span>
              <span className="text-[11px] text-slate-500">Access suspended immediately upon creation</span>
            </div>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
        <Link
          to={cancelPath}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 transition-all text-center cursor-pointer shadow-2xs"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isLoading || (!isLoadingClinics && clinics.length === 0)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving Administrator Account...</span>
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Save Admin Account</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
