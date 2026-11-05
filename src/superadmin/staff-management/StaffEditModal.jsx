import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Ban,
  Save,
  Hash,
  Lock,
} from 'lucide-react';
import staffManagementService from '../services/staffManagementService';
import { useToast } from '../../context/ToastContext';

const COMMON_DEPARTMENTS = [
  'Dental',
  'Cosmetology',
  'Dermatology',
  'Aesthetics & Wellness',
  'Physiotherapy',
  'Aesthetics & Cosmetology',
  'Trichology (Hair Care)',
  'General Medicine / OPD',
  'Plastic & Cosmetic Surgery',
  'Nutrition & Dietetics',
  'Ayurveda & Wellness',
  'Orthopedics',
  'Gynecology & Obstetrics',
  'Pediatrics',
  'Cardiology',
  'ENT (Ear, Nose, Throat)',
  'Ophthalmology',
  'Psychiatry & Psychology',
  'Radiology & Diagnostics',
  'Pathology & Laboratory',
  'Nursing & Patient Care',
  'Pharmacy',
  'Clinical Administration',
];

const EMPLOYMENT_TYPES = [
  'Full-Time',
  'Part-Time',
  'Contract',
  'Intern',
];

export default function StaffEditModal({ staff, isOpen, onClose, onSuccess }) {
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    mobile: '',
    department: '',
    designation: '',
    employment_type: 'Full-Time',
    joining_date: '',
    address: '',
    status: 'active',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (staff) {
      let initialStatus = 'active';
      if (staff.status) {
        initialStatus = staff.status;
      } else if (staff.is_active === false) {
        initialStatus = 'inactive';
      }

      setFormData({
        name: staff.name || '',
        email: staff.email || '',
        password: '',
        mobile: staff.mobile || '',
        department: staff.department || 'Dental',
        designation: staff.designation || '',
        employment_type: staff.employment_type || 'Full-Time',
        joining_date: staff.joining_date ? staff.joining_date.split('T')[0] : '',
        address: staff.address || '',
        status: initialStatus,
      });
      setErrors({});
    }
  }, [staff]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !staff) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required.';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email format.';
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

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim() || null,
        department: formData.department || null,
        designation: formData.designation.trim() || null,
        employment_type: formData.employment_type || 'Full-Time',
        joining_date: formData.joining_date || null,
        address: formData.address.trim() || null,
        status: formData.status,
      };

      if (formData.password && formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      const response = await staffManagementService.updateStaff(staff.id, payload);

      toast.success(`Staff member '${formData.name}' updated successfully.`);

      if (onSuccess) {
        onSuccess(response.staff || response.data || response);
      }
      onClose();
    } catch (err) {
      console.error('Error updating staff:', err);
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const backendErrors = {};
        for (const [key, messages] of Object.entries(err.response.data.errors)) {
          backendErrors[key] = messages[0];
        }
        setErrors(backendErrors);
      } else {
        const msg =
          err.response?.data?.message || 'Failed to update staff member. Please try again.';
        setErrors({ general: msg });
        toast.error(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={!isSubmitting ? onClose : undefined}
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-4">
        <div
          className="relative bg-white w-full max-w-2xl rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-4 sm:my-8 animate-slide-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-400 via-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold shrink-0 icon-3d shadow-md">
                <Hash className="w-5 h-5 drop-shadow-sm" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    Edit Staff Member
                  </h2>
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    {staff.staff_code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  Update staff profile details, department role, or active status.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Form Scrollable Body */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto min-w-0">
            {errors.general && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="font-medium">{errors.general}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Sarah Jenkins"
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                      errors.name
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                        : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/15'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.name}</p>
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
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sarah.jenkins@iniya.com"
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                      errors.email
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                        : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/15'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Mobile Phone */}
              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="+91 98765 43210"
                    disabled={isSubmitting}
                    className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 ${
                      errors.mobile
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                        : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/15'
                    }`}
                  />
                </div>
                {errors.mobile && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.mobile}</p>
                )}
              </div>

              {/* Reset Password Optional */}
              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reset Password <span className="text-slate-400 font-normal lowercase">(leave blank to keep)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="New password (optional)"
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="min-w-0">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200 cursor-pointer"
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
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Senior Dental Surgeon"
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
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
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200 cursor-pointer"
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
                    onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="min-w-0">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Address / Work Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="e.g. Sector 18 Clinic, Gurugram, HR"
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all duration-200 resize-none"
                />
              </div>
            </div>

            {/* Account Status Radio Cards */}
            <div className="min-w-0">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Operational Status
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Active */}
                <label
                  className={`relative flex flex-col p-3 rounded-2xl border cursor-pointer transition-all ${
                    formData.status === 'active'
                      ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Active</span>
                    </div>
                    <input
                      type="radio"
                      name="staff_status"
                      value="active"
                      checked={formData.status === 'active'}
                      onChange={() => setFormData({ ...formData, status: 'active' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Active staff member currently in service.
                  </p>
                </label>

                {/* Inactive */}
                <label
                  className={`relative flex flex-col p-3 rounded-2xl border cursor-pointer transition-all ${
                    formData.status === 'inactive'
                      ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>Inactive</span>
                    </div>
                    <input
                      type="radio"
                      name="staff_status"
                      value="inactive"
                      checked={formData.status === 'inactive'}
                      onChange={() => setFormData({ ...formData, status: 'inactive' })}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Deactivated, on prolonged leave, or suspended.
                  </p>
                </label>

                {/* Blocked */}
                <label
                  className={`relative flex flex-col p-3 rounded-2xl border cursor-pointer transition-all ${
                    formData.status === 'blocked'
                      ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20 shadow-xs'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs">
                      <Ban className="w-4 h-4 text-rose-600" />
                      <span>Blocked</span>
                    </div>
                    <input
                      type="radio"
                      name="staff_status"
                      value="blocked"
                      checked={formData.status === 'blocked'}
                      onChange={() => setFormData({ ...formData, status: 'blocked' })}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Strictly blocked from operational access.
                  </p>
                </label>
              </div>
            </div>

            {/* Footer Buttons (Sticky, Responsive) */}
            <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
