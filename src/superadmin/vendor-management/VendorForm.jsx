import React, { useState, useEffect } from 'react';
import {
  Building,
  User,
  Mail,
  Phone,
  FileText,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Hash,
  Sparkles,
  CreditCard,
  Layers,
  Globe,
} from 'lucide-react';
import vendorManagementService from '../services/vendorManagementService';

const VENDOR_TYPES = [
  'Supplier',
  'Manufacturer',
  'Distributor',
  'Wholesaler',
  'Service Provider',
  'Contractor',
  'Other',
];

export default function VendorForm({
  onSubmit,
  isLoading = false,
  cancelPath = '/superadmin/vendors',
}) {
  const [formData, setFormData] = useState({
    vendor_name: '',
    company_name: '',
    vendor_type: 'Supplier',
    gst_number: '',
    pan_number: '',
    email: '',
    mobile: '',
    alternate_mobile: '',
    contact_person: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    notes: '',
    status: 'active',
  });

  const [previewCode, setPreviewCode] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch next vendor code preview
    vendorManagementService
      .getPreviewCode()
      .then((res) => {
        if (res.preview_code) {
          setPreviewCode(res.preview_code);
        }
      })
      .catch(() => {
        setPreviewCode('VEN-0001');
      });
  }, []);

  const handleChange = (field, value) => {
    let finalValue = value;
    if (field === 'gst_number' || field === 'pan_number') {
      finalValue = value.toUpperCase();
    }
    setFormData((prev) => ({ ...prev, [field]: finalValue }));
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

    if (!formData.vendor_name.trim()) {
      errs.vendor_name = 'Vendor name is required.';
    } else if (formData.vendor_name.trim().length < 2) {
      errs.vendor_name = 'Vendor name must be at least 2 characters.';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!formData.mobile.trim()) {
      errs.mobile = 'Mobile number is required.';
    } else if (
      !/^(\+?\d{1,4}[-.\s]?)?(\(?\d{2,5}\)?[-.\s]?)?\d{3,5}[-.\s]?\d{3,5}$/.test(
        formData.mobile.trim()
      ) ||
      formData.mobile.replace(/\D/g, '').length < 7
    ) {
      errs.mobile = 'Please enter a valid mobile number (min 7 digits).';
    }

    if (formData.gst_number && formData.gst_number.trim().length > 15) {
      errs.gst_number = 'GST Number must not exceed 15 characters.';
    }

    if (formData.pan_number && formData.pan_number.trim().length > 10) {
      errs.pan_number = 'PAN Number must not exceed 10 characters.';
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
        vendor_name: formData.vendor_name.trim(),
        company_name: formData.company_name.trim() || null,
        vendor_type: formData.vendor_type || null,
        gst_number: formData.gst_number.trim() || null,
        pan_number: formData.pan_number.trim() || null,
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
        alternate_mobile: formData.alternate_mobile.trim() || null,
        contact_person: formData.contact_person.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        postal_code: formData.postal_code.trim() || null,
        country: formData.country.trim() || 'India',
        notes: formData.notes.trim() || null,
        status: formData.status || 'active',
      });

      // Reset form on success
      setFormData({
        vendor_name: '',
        company_name: '',
        vendor_type: 'Supplier',
        gst_number: '',
        pan_number: '',
        email: '',
        mobile: '',
        alternate_mobile: '',
        contact_person: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        notes: '',
        status: 'active',
      });
      setErrors({});

      // Refresh code preview
      vendorManagementService.getPreviewCode().then((res) => {
        if (res.preview_code) setPreviewCode(res.preview_code);
      });
    } catch (err) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        setErrors({
          general:
            err.response?.data?.message ||
            'Failed to create vendor. Please check all details and try again.',
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

      {/* Vendor Code Preview Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-cyan-50/40 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs animate-slide-up">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold shrink-0 icon-3d shadow-md">
            <Hash className="w-5 h-5 drop-shadow-sm" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-800">
                Vendor Code Auto-Generation
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200/60">
                <Sparkles className="w-3 h-3 animate-pulse-glow" />
                Next Available
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">
              Assigned automatically by the backend upon record creation.
            </p>
          </div>
        </div>
        <div className="self-stretch sm:self-auto text-center px-4 py-2 rounded-xl bg-white border border-blue-200 text-blue-700 font-mono text-sm font-bold tracking-wider shadow-2xs shrink-0">
          {previewCode || 'VEN-0001'}
        </div>
      </div>

      {/* SECTION 1: BASIC INFORMATION */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-blue-200/80 transition-all duration-300 space-y-4 animate-slide-up stagger-1 group">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shrink-0 icon-3d shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Building className="w-4 h-4 drop-shadow-sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-mono text-[10px] font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Basic Information
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Vendor Name */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Vendor Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
              <input
                type="text"
                value={formData.vendor_name}
                onChange={(e) => handleChange('vendor_name', e.target.value)}
                placeholder="e.g. Apex Industrial Supplies"
                disabled={isLoading}
                required
                className={`w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 shadow-2xs ${
                  errors.vendor_name
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/15'
                }`}
              />
            </div>
            {errors.vendor_name && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{Array.isArray(errors.vendor_name) ? errors.vendor_name[0] : errors.vendor_name}</span>
              </p>
            )}
          </div>

          {/* Company Name */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Company Name <span className="text-slate-400 text-[10px] lowercase font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => handleChange('company_name', e.target.value)}
                placeholder="e.g. Apex Global Corp Ltd."
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all duration-200 shadow-2xs"
              />
            </div>
            {errors.company_name && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{Array.isArray(errors.company_name) ? errors.company_name[0] : errors.company_name}</span>
              </p>
            )}
          </div>

          {/* Vendor Type */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Vendor Type
            </label>
            <div className="relative">
              <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={formData.vendor_type}
                onChange={(e) => handleChange('vendor_type', e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all duration-200 shadow-2xs cursor-pointer"
              >
                {VENDOR_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            {errors.vendor_type && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{Array.isArray(errors.vendor_type) ? errors.vendor_type[0] : errors.vendor_type}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: TAX & LEGAL IDENTIFICATION */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-amber-200/80 transition-all duration-300 space-y-4 animate-slide-up stagger-2 group">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 icon-3d shadow-sm group-hover:scale-105 transition-transform duration-300">
            <CreditCard className="w-4 h-4 drop-shadow-sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 font-mono text-[10px] font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Tax &amp; Legal Details
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GST Number */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              GST Number <span className="text-slate-400 text-[10px] lowercase font-normal">(unique, max 15)</span>
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.gst_number}
                onChange={(e) => handleChange('gst_number', e.target.value)}
                placeholder="27ABCDE1234F1Z5"
                maxLength={15}
                disabled={isLoading}
                className={`w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 shadow-2xs ${
                  errors.gst_number
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/15'
                }`}
              />
            </div>
            {errors.gst_number && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{Array.isArray(errors.gst_number) ? errors.gst_number[0] : errors.gst_number}</span>
              </p>
            )}
          </div>

          {/* PAN Number */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              PAN Number <span className="text-slate-400 text-[10px] lowercase font-normal">(max 10)</span>
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.pan_number}
                onChange={(e) => handleChange('pan_number', e.target.value)}
                placeholder="ABCDE1234F"
                maxLength={10}
                disabled={isLoading}
                className={`w-full pl-10 pr-4 py-2.5 text-xs font-mono bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border rounded-xl focus:outline-none focus:ring-4 transition-all duration-200 shadow-2xs ${
                  errors.pan_number
                    ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/15'
                    : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/15'
                }`}
              />
            </div>
            {errors.pan_number && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{Array.isArray(errors.pan_number) ? errors.pan_number[0] : errors.pan_number}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 3: CONTACT INFORMATION */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-emerald-200/80 transition-all duration-300 space-y-4 animate-slide-up stagger-3 group">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-400 via-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 icon-3d shadow-sm group-hover:scale-105 transition-transform duration-300">
            <Phone className="w-4 h-4 drop-shadow-sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-mono text-[10px] font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Contact Information
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                placeholder="orders@apexsupplies.com"
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

          {/* Contact Person */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Contact Person <span className="text-slate-400 text-[10px] lowercase font-normal">(optional)</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => handleChange('contact_person', e.target.value)}
                placeholder="e.g. Ramesh Patel"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all duration-200 shadow-2xs"
              />
            </div>
            {errors.contact_person && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{Array.isArray(errors.contact_person) ? errors.contact_person[0] : errors.contact_person}</span>
              </p>
            )}
          </div>

          {/* Primary Mobile */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Primary Mobile <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
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

          {/* Alternate Mobile */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Alternate Mobile <span className="text-slate-400 text-[10px] lowercase font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.alternate_mobile}
                onChange={(e) => handleChange('alternate_mobile', e.target.value)}
                placeholder="+91 98765 00000"
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all duration-200 shadow-2xs"
              />
            </div>
            {errors.alternate_mobile && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{Array.isArray(errors.alternate_mobile) ? errors.alternate_mobile[0] : errors.alternate_mobile}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 4: ADDRESS & LOCATION */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-purple-200/80 transition-all duration-300 space-y-4 animate-slide-up stagger-4 group">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 via-indigo-600 to-purple-700 text-white flex items-center justify-center shrink-0 icon-3d shadow-sm group-hover:scale-105 transition-transform duration-300">
            <MapPin className="w-4 h-4 drop-shadow-sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 font-mono text-[10px] font-bold flex items-center justify-center">
              4
            </span>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Address &amp; Location
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Full Address */}
          <div className="sm:col-span-2 md:col-span-4 min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Street / Premise Address
            </label>
            <textarea
              rows={2}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Building No., Industrial Area, Sector 5..."
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all duration-200 shadow-2xs resize-none"
            />
          </div>

          {/* City */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              City
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="e.g. Mumbai"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all duration-200 shadow-2xs"
            />
          </div>

          {/* State */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              State
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              placeholder="e.g. Maharashtra"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all duration-200 shadow-2xs"
            />
          </div>

          {/* Postal Code */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Postal Code
            </label>
            <input
              type="text"
              value={formData.postal_code}
              onChange={(e) => handleChange('postal_code', e.target.value)}
              placeholder="e.g. 400001"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all duration-200 shadow-2xs font-mono"
            />
          </div>

          {/* Country */}
          <div className="min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Country
            </label>
            <div className="relative">
              <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                placeholder="India"
                disabled={isLoading}
                className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all duration-200 shadow-2xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: NOTES & STATUS */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all duration-300 space-y-4 animate-slide-up stagger-5 group">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-700 via-slate-800 to-slate-900 text-white flex items-center justify-center shrink-0 icon-3d shadow-sm group-hover:scale-105 transition-transform duration-300">
            <FileText className="w-4 h-4 drop-shadow-sm" />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold flex items-center justify-center">
              5
            </span>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Notes &amp; Status
            </h3>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Internal Administrative Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Enter special procurement terms, vendor credibility notes, etc..."
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 transition-all duration-200 shadow-2xs resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Initial Account Status
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Active */}
              <label
                className={`relative flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
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
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-emerald-800 block">Active</span>
                  <span className="text-[11px] text-slate-500 leading-tight block">Authorized for POs &amp; billing</span>
                </div>
              </label>

              {/* Inactive */}
              <label
                className={`relative flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
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
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-4 h-4 text-amber-600 focus:ring-amber-500 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-amber-800 block">Inactive</span>
                  <span className="text-[11px] text-slate-500 leading-tight block">Suspended from transactions</span>
                </div>
              </label>

              {/* Blocked */}
              <label
                className={`relative flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  formData.status === 'blocked'
                    ? 'border-rose-500/50 bg-rose-50/60 ring-2 ring-rose-500/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/60'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value="blocked"
                  checked={formData.status === 'blocked'}
                  onChange={(e) => handleChange('status', e.target.value)}
                  className="w-4 h-4 text-rose-600 focus:ring-rose-500 shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-rose-800 block">Blocked</span>
                  <span className="text-[11px] text-slate-500 leading-tight block">Blacklisted procurement</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* FORM ACTIONS (Fully responsive, no overflow) */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-5 border-t border-slate-200/80">
        <a
          href={cancelPath}
          className="w-full sm:w-auto text-center px-6 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200 cursor-pointer shadow-2xs"
        >
          Cancel
        </a>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Registering Vendor...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Register Vendor Profile</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
