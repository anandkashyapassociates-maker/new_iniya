import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Building2,
  Lock,
  MapPin,
  Phone,
  Mail,
  User,
  Layers,
  Globe,
  Clock,
  AlertCircle,
  Save,
  CheckCircle2,
} from 'lucide-react';
import clinicManagementService from '../services/clinicManagementService';
import { useToast } from '../../context/ToastContext';
import { INDIAN_STATES } from '../../utils/indiaStates';

export default function ClinicEditModal({ isOpen, onClose, clinic, onSuccess }) {
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    branch_name: '',
    location: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    phone: '',
    alternate_phone: '',
    email: '',
    contact_person: '',
    status: 'active',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (clinic) {
      setFormData({
        name: clinic.name || '',
        branch_name: clinic.branch_name || '',
        location: clinic.location || '',
        address: clinic.address || '',
        city: clinic.city || '',
        state: clinic.state || '',
        postal_code: clinic.postal_code || '',
        country: clinic.country || 'India',
        phone: clinic.phone || '',
        alternate_phone: clinic.alternate_phone || '',
        email: clinic.email || '',
        contact_person: clinic.contact_person || '',
        status: clinic.status || 'active',
        notes: clinic.notes || '',
      });
      setErrors({});
    }
  }, [clinic]);

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

  if (!isOpen || !clinic) return null;

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
      errs.name = 'Clinic name is required.';
    } else if (formData.name.trim().length < 3) {
      errs.name = 'Clinic name must be at least 3 characters.';
    }

    if (!formData.location.trim()) {
      errs.location = 'Clinic location / area is required.';
    }

    if (!formData.address.trim()) {
      errs.address = 'Full physical street address is required.';
    }

    if (!formData.phone.trim()) {
      errs.phone = 'Primary phone number is required.';
    } else if (!/^[0-9+\-\s()]{7,20}$/.test(formData.phone.trim())) {
      errs.phone = 'Please provide a valid phone number.';
    }

    if (formData.email && formData.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        errs.email = 'Please provide a valid email address.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await clinicManagementService.updateClinic(clinic.id, formData);
      toast.success(`Clinic '${formData.name}' updated successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating clinic:', err);
      const msg = err.response?.data?.message || 'Failed to update clinic record.';
      setErrors({ general: msg });
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={!isSubmitting ? onClose : undefined}
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-5">
        <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-4 sm:my-6 animate-scale-up z-10">
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-600 text-white flex items-center justify-center shrink-0 icon-3d shadow-md">
                <Building2 className="w-5 h-5 drop-shadow-sm" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 truncate">
                    Edit Clinic: {clinic.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-100 text-blue-700 border border-blue-200/60">
                    <Lock className="w-3 h-3" />
                    {clinic.clinic_code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  Location: <span className="font-medium text-slate-700">{clinic.location}</span> • Clinic code is permanent.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors disabled:opacity-50 cursor-pointer shrink-0 ml-2"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 min-h-0">
              {errors.general && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 shadow-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-medium">{errors.general}</span>
                </div>
              )}

              {/* 1. Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-mono text-[9px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Basic Clinic Information
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Clinic Name */}
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Clinic Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g. Iniya Aesthetics & Wellness"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-4 transition-all duration-200 ${
                        errors.name
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                      }`}
                    />
                    {errors.name && <p className="text-[10px] text-rose-600 mt-1">{errors.name}</p>}
                  </div>

                  {/* Branch Name */}
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Branch Identifier <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.branch_name}
                      onChange={(e) => handleChange('branch_name', e.target.value)}
                      placeholder="e.g. Indiranagar Branch"
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>

                  {/* Contact Person */}
                  <div className="sm:col-span-2 min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Clinic In-Charge / Manager <span className="text-slate-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) => handleChange('contact_person', e.target.value)}
                      placeholder="e.g. Dr. Ramesh Kumar / Operations Desk"
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Location & Address */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-mono text-[9px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Location &amp; Physical Address
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Location Area */}
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Location / Area <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="e.g. Indiranagar 100ft Road"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-4 transition-all duration-200 ${
                        errors.location
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                      }`}
                    />
                    {errors.location && <p className="text-[10px] text-rose-600 mt-1">{errors.location}</p>}
                  </div>

                  {/* City */}
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="e.g. Bengaluru"
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>

                  {/* Full Street Address */}
                  <div className="sm:col-span-2 min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Physical Street Address <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="Complete physical street address"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-4 transition-all duration-200 ${
                        errors.address
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                      }`}
                    />
                    {errors.address && <p className="text-[10px] text-rose-600 mt-1">{errors.address}</p>}
                  </div>

                  {/* State */}
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State
                    </label>
                    <select
                      value={formData.state || ''}
                      onChange={(e) => handleChange('state', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200 cursor-pointer text-slate-800 font-medium"
                    >
                      <option value="">Select State</option>
                      {formData.state && !INDIAN_STATES.includes(formData.state) && (
                        <option value={formData.state}>{formData.state}</option>
                      )}
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Postal Code */}
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Postal / PIN Code
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => handleChange('postal_code', e.target.value)}
                      placeholder="e.g. 560038"
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>

                  {/* Country (Read-Only) */}
                  <div className="sm:col-span-2 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Country
                      </label>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Fixed / Readonly</span>
                    </div>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        readOnly
                        value={formData.country || 'India'}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 text-slate-600 font-medium rounded-xl cursor-not-allowed select-none outline-none"
                        title="Country is set to India by default (read-only)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Contact & Status */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 font-mono text-[9px] font-bold flex items-center justify-center">
                    3
                  </span>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Contact &amp; Operational Status
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Phone */}
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Primary Phone <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+91 9876543210"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-4 transition-all duration-200 ${
                        errors.phone
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                      }`}
                    />
                    {errors.phone && <p className="text-[10px] text-rose-600 mt-1">{errors.phone}</p>}
                  </div>

                  {/* Alternate Phone */}
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alternate Phone
                    </label>
                    <input
                      type="text"
                      value={formData.alternate_phone}
                      onChange={(e) => handleChange('alternate_phone', e.target.value)}
                      placeholder="080-23456789"
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>

                  {/* Email */}
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Clinic Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="clinic@iniya.com"
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-4 transition-all duration-200 ${
                        errors.email
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                      }`}
                    />
                    {errors.email && <p className="text-[10px] text-rose-600 mt-1">{errors.email}</p>}
                  </div>

                  {/* Operational Status */}
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200 cursor-pointer"
                    >
                      <option value="active">Operational (Active)</option>
                      <option value="inactive">Inactive / Suspended</option>
                      <option value="maintenance">Under Maintenance</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="sm:col-span-2 min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Administrative Notes
                    </label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      placeholder="Operational notes, facilities, rooms..."
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Updating...</span>
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

  return createPortal(modalContent, document.body);
}
