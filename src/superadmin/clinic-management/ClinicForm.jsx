import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  Hash,
  Sparkles,
  FileText,
  Globe,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
} from 'lucide-react';
import clinicManagementService from '../services/clinicManagementService';

export default function ClinicForm({
  onSubmit,
  initialData = null,
  isLoading = false,
  cancelPath = '/superadmin/clinics',
  isEdit = false,
}) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    branch_name: initialData?.branch_name || '',
    location: initialData?.location || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    postal_code: initialData?.postal_code || '',
    country: initialData?.country || 'India',
    phone: initialData?.phone || '',
    alternate_phone: initialData?.alternate_phone || '',
    email: initialData?.email || '',
    contact_person: initialData?.contact_person || '',
    status: initialData?.status || 'active',
    notes: initialData?.notes || '',
  });

  const [previewCode, setPreviewCode] = useState(initialData?.clinic_code || '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isEdit && !previewCode) {
      clinicManagementService
        .getPreviewCode()
        .then((res) => {
          if (res.preview_code) {
            setPreviewCode(res.preview_code);
          }
        })
        .catch(() => {
          setPreviewCode('CLN-0001');
        });
    }
  }, [isEdit, previewCode]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 0. AUTO CODE GENERATION PREVIEW BANNER */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-blue-50/30 border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold font-mono text-sm shadow-sm shrink-0 icon-3d">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold font-display text-slate-900">
                Clinic Code {isEdit ? 'Identifier' : 'Auto-Generation'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100/80 text-blue-700">
                <Sparkles className="w-3 h-3 text-blue-600 animate-pulse" />
                {isEdit ? 'Assigned' : 'Next Available'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 font-normal">
              {isEdit
                ? 'Fixed sequential identifier registered in the database.'
                : 'Assigned automatically by the backend upon record creation.'}
            </p>
          </div>
        </div>

        <div className="self-end sm:self-auto bg-white/90 border border-blue-200/90 rounded-xl px-4 py-2 font-mono text-xs sm:text-sm font-bold text-blue-700 shadow-2xs tracking-wider">
          {previewCode || 'CLN-XXXX'}
        </div>
      </div>

      {/* 1. BASIC CLINIC INFORMATION */}
      <div className="bg-slate-50/60 rounded-2xl p-4 sm:p-5 border border-slate-200/70 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>1. Basic Clinic Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Clinic Name */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Clinic Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g. Iniya Aesthetics & Wellness - Indiranagar"
                className={`w-full bg-white border text-xs font-medium rounded-xl pl-10 pr-3.5 py-2.5 outline-none transition-all ${
                  errors.name
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
                }`}
              />
            </div>
            {errors.name && <p className="text-[11px] text-rose-500 font-medium">{errors.name}</p>}
          </div>

          {/* Branch Identifier */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Branch Name <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.branch_name}
                onChange={(e) => handleChange('branch_name', e.target.value)}
                placeholder="e.g. Flagship / Main Branch"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium rounded-xl pl-10 pr-3.5 py-2.5 outline-none transition-all"
              />
            </div>
          </div>

          {/* Contact Person / Manager */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Clinic Manager / In-Charge Person <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => handleChange('contact_person', e.target.value)}
                placeholder="e.g. Dr. Rajesh Sharma / Operations Head"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium rounded-xl pl-10 pr-3.5 py-2.5 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. LOCATION & PHYSICAL ADDRESS */}
      <div className="bg-slate-50/60 rounded-2xl p-4 sm:p-5 border border-slate-200/70 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>2. Location &amp; Physical Address</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Clinic Location / Area */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Location / Area <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="e.g. Indiranagar 100ft Road / Koramangala 4th Block"
                className={`w-full bg-white border text-xs font-medium rounded-xl pl-10 pr-3.5 py-2.5 outline-none transition-all ${
                  errors.location
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
                }`}
              />
            </div>
            {errors.location && <p className="text-[11px] text-rose-500 font-medium">{errors.location}</p>}
          </div>

          {/* City */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="e.g. Bengaluru"
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium rounded-xl px-3.5 py-2.5 outline-none transition-all"
            />
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              State
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="e.g. Karnataka"
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium rounded-xl px-3.5 py-2.5 outline-none transition-all"
            />
          </div>

          {/* Complete Street Address */}
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Full Physical Street Address <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="e.g. No. 42, 100ft Road, Opposite Metro Pillar 120, Indiranagar, Bengaluru, Karnataka"
              className={`w-full bg-white border text-xs font-medium rounded-xl p-3 outline-none transition-all ${
                errors.address
                  ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
              }`}
            />
            {errors.address && <p className="text-[11px] text-rose-500 font-medium">{errors.address}</p>}
          </div>

          {/* Postal Code / PIN */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Postal / PIN Code
            </label>
            <input
              type="text"
              value={formData.postal_code}
              onChange={(e) => handleChange('postal_code', e.target.value)}
              placeholder="e.g. 560038"
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium rounded-xl px-3.5 py-2.5 outline-none transition-all"
            />
          </div>

          {/* Country */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Country
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="India"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium rounded-xl pl-10 pr-3.5 py-2.5 outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. CONTACT & COMMUNICATION */}
      <div className="bg-slate-50/60 rounded-2xl p-4 sm:p-5 border border-slate-200/70 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Phone className="w-4 h-4 text-purple-600" />
          <span>3. Contact &amp; Communication Details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Primary Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Primary Phone / Reception <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="e.g. +91 9876543210"
                className={`w-full bg-white border text-xs font-medium rounded-xl pl-10 pr-3.5 py-2.5 outline-none transition-all ${
                  errors.phone
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
                }`}
              />
            </div>
            {errors.phone && <p className="text-[11px] text-rose-500 font-medium">{errors.phone}</p>}
          </div>

          {/* Alternate Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Alternate Phone <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.alternate_phone}
                onChange={(e) => handleChange('alternate_phone', e.target.value)}
                placeholder="e.g. 080-23456789"
                className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium rounded-xl pl-10 pr-3.5 py-2.5 outline-none transition-all"
              />
            </div>
          </div>

          {/* Official Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Clinic Email <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g. clinic.indiranagar@iniya.com"
                className={`w-full bg-white border text-xs font-medium rounded-xl pl-10 pr-3.5 py-2.5 outline-none transition-all ${
                  errors.email
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
                }`}
              />
            </div>
            {errors.email && <p className="text-[11px] text-rose-500 font-medium">{errors.email}</p>}
          </div>
        </div>
      </div>

      {/* 4. OPERATIONAL STATUS & NOTES */}
      <div className="bg-slate-50/60 rounded-2xl p-4 sm:p-5 border border-slate-200/70 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Clock className="w-4 h-4 text-amber-600" />
          <span>4. Operational Status &amp; Administrative Notes</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Status Dropdown */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Operational Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-semibold text-slate-800 rounded-xl px-3.5 py-2.5 outline-none cursor-pointer transition-all"
            >
              <option value="active">Operational (Active)</option>
              <option value="inactive">Inactive / Suspended</option>
              <option value="maintenance">Under Maintenance</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Administrative Notes <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="e.g. 5 Consultation rooms, 2 Laser suites, Operational hours 9 AM - 8 PM"
              className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 text-xs font-medium rounded-xl px-3.5 py-2.5 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* ACTIONS ROW */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <a
          href={cancelPath}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{isEdit ? 'Saving Changes...' : 'Provisioning Clinic...'}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEdit ? 'Save Clinic Changes' : 'Provision New Clinic'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

