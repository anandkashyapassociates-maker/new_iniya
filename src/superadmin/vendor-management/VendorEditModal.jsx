import React, { useState, useEffect } from 'react';
import {
  X,
  Building,
  User,
  Mail,
  Phone,
  FileText,
  MapPin,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  CreditCard,
  Layers,
  Globe,
} from 'lucide-react';
import vendorManagementService from '../services/vendorManagementService';
import { useToast } from '../../context/ToastContext';

const VENDOR_TYPES = [
  'Supplier',
  'Manufacturer',
  'Distributor',
  'Wholesaler',
  'Service Provider',
  'Contractor',
  'Other',
];

export default function VendorEditModal({ vendor, isOpen, onClose, onSuccess }) {
  const toast = useToast();

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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (vendor) {
      setFormData({
        vendor_name: vendor.vendor_name || '',
        company_name: vendor.company_name || '',
        vendor_type: vendor.vendor_type || 'Supplier',
        gst_number: vendor.gst_number || '',
        pan_number: vendor.pan_number || '',
        email: vendor.email || '',
        mobile: vendor.mobile || '',
        alternate_mobile: vendor.alternate_mobile || '',
        contact_person: vendor.contact_person || '',
        address: vendor.address || '',
        city: vendor.city || '',
        state: vendor.state || '',
        postal_code: vendor.postal_code || '',
        country: vendor.country || 'India',
        notes: vendor.notes || '',
        status: vendor.status || 'active',
      });
      setErrors({});
    }
  }, [vendor]);

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

  if (!isOpen || !vendor) return null;

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
      errs.email = 'Please provide a valid email format.';
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

    setIsSubmitting(true);

    try {
      const payload = {
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
        status: formData.status,
      };

      const response = await vendorManagementService.updateVendor(vendor.id, payload);
      toast.success(`Vendor '${formData.vendor_name}' updated successfully.`);

      if (onSuccess) {
        onSuccess(response.vendor || response.data || response);
      }
      onClose();
    } catch (err) {
      console.error('Error updating vendor:', err);
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const backendErrors = {};
        for (const [key, messages] of Object.entries(err.response.data.errors)) {
          backendErrors[key] = messages[0];
        }
        setErrors(backendErrors);
      } else {
        const msg =
          err.response?.data?.message || 'Failed to update vendor. Please try again.';
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
        <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-4 sm:my-8 animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 text-white flex items-center justify-center shrink-0 icon-3d shadow-md">
                <Building className="w-5 h-5 drop-shadow-sm" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 truncate">
                    Edit Vendor Profile
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-100 text-blue-700 border border-blue-200/60">
                    <Lock className="w-3 h-3" />
                    {vendor.vendor_code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate">
                  Vendor code is permanent and immutable for audit consistency.
                </p>
              </div>
            </div>
            <button
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
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-mono text-[9px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Basic Info
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Vendor Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.vendor_name}
                      onChange={(e) => handleChange('vendor_name', e.target.value)}
                      required
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-4 transition-all duration-200 ${
                        errors.vendor_name
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                      }`}
                    />
                    {errors.vendor_name && (
                      <p className="text-[10px] text-rose-600 mt-1">{errors.vendor_name}</p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => handleChange('company_name', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Vendor Type
                    </label>
                    <select
                      value={formData.vendor_type}
                      onChange={(e) => handleChange('vendor_type', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200 cursor-pointer"
                    >
                      {VENDOR_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Tax & Legal */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 font-mono text-[9px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Tax &amp; Legal Details
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      GST Number
                    </label>
                    <input
                      type="text"
                      value={formData.gst_number}
                      onChange={(e) => handleChange('gst_number', e.target.value)}
                      maxLength={15}
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-4 transition-all duration-200 ${
                        errors.gst_number
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                      }`}
                    />
                    {errors.gst_number && (
                      <p className="text-[10px] text-rose-600 mt-1">{errors.gst_number}</p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={formData.pan_number}
                      onChange={(e) => handleChange('pan_number', e.target.value)}
                      maxLength={10}
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 text-xs font-mono uppercase bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-4 transition-all duration-200 ${
                        errors.pan_number
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                      }`}
                    />
                    {errors.pan_number && (
                      <p className="text-[10px] text-rose-600 mt-1">{errors.pan_number}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Contact Info */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 font-mono text-[9px] font-bold flex items-center justify-center">
                    3
                  </span>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Contact Information
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      required
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-4 transition-all duration-200 ${
                        errors.email
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-[10px] text-rose-600 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Primary Mobile <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.mobile}
                      onChange={(e) => handleChange('mobile', e.target.value)}
                      required
                      disabled={isSubmitting}
                      className={`w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl focus:bg-white focus:outline-none focus:ring-4 transition-all duration-200 ${
                        errors.mobile
                          ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                      }`}
                    />
                    {errors.mobile && (
                      <p className="text-[10px] text-rose-600 mt-1">{errors.mobile}</p>
                    )}
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alternate Mobile
                    </label>
                    <input
                      type="text"
                      value={formData.alternate_mobile}
                      onChange={(e) => handleChange('alternate_mobile', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      value={formData.contact_person}
                      onChange={(e) => handleChange('contact_person', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Address */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 font-mono text-[9px] font-bold flex items-center justify-center">
                    4
                  </span>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Address &amp; Location
                  </h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div className="sm:col-span-2 md:col-span-4 min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Street Address
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={formData.postal_code}
                      onChange={(e) => handleChange('postal_code', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200 font-mono"
                    />
                  </div>

                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Notes & Status */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-700 font-mono text-[9px] font-bold flex items-center justify-center">
                    5
                  </span>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Notes &amp; Account Status
                  </h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Internal Notes
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Account Status
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                          formData.status === 'active'
                            ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="edit_status"
                          value="active"
                          checked={formData.status === 'active'}
                          onChange={(e) => handleChange('status', e.target.value)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                        />
                        <div className="text-xs min-w-0">
                          <span className="font-bold block">Active</span>
                          <span className="text-[10px] text-slate-500 block truncate">Authorized</span>
                        </div>
                      </label>

                      <label
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                          formData.status === 'inactive'
                            ? 'border-amber-500 bg-amber-50/60 text-amber-900 ring-2 ring-amber-500/20 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="edit_status"
                          value="inactive"
                          checked={formData.status === 'inactive'}
                          onChange={(e) => handleChange('status', e.target.value)}
                          className="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer shrink-0"
                        />
                        <div className="text-xs min-w-0">
                          <span className="font-bold block">Inactive</span>
                          <span className="text-[10px] text-slate-500 block truncate">Suspended</span>
                        </div>
                      </label>

                      <label
                        className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                          formData.status === 'blocked'
                            ? 'border-rose-500 bg-rose-50/60 text-rose-900 ring-2 ring-rose-500/20 shadow-xs'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="edit_status"
                          value="blocked"
                          checked={formData.status === 'blocked'}
                          onChange={(e) => handleChange('status', e.target.value)}
                          className="w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer shrink-0"
                        />
                        <div className="text-xs min-w-0">
                          <span className="font-bold block">Blocked</span>
                          <span className="text-[10px] text-slate-500 block truncate">Blacklisted</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions (sticky footer) */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 shrink-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors disabled:opacity-50 cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Changes...</span>
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
