import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Wallet,
  Building2,
  ChevronRight,
  ArrowLeft,
  UserCheck,
  Search,
  MapPin,
  Compass,
  Globe,
  Phone,
  Lock,
  Banknote,
  CreditCard,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  X,
  Sparkles,
} from 'lucide-react';
import { payoutService } from '../services/payoutService';
import clinicManagementService from '../services/clinicManagementService';
import { useToast } from '../../context/ToastContext';

export default function StaffPayoutCreatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const toast = useToast();

  const isEditMode = Boolean(id);

  // Data collections
  const [clinics, setClinics] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(true);
  const [isLoadingInitial, setIsLoadingInitial] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selection & search states
  const [selectedLocation, setSelectedLocation] = useState('');
  const [clinicSearchTerm, setClinicSearchTerm] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    clinic_id: '',
    staff_id: '',
    amount: '',
    payout_date: new Date().toISOString().split('T')[0],
    account_type: 'Bank',
    reference_number: '',
    note: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Existing payout if in edit mode
  const [existingPayout, setExistingPayout] = useState(null);

  // Load active clinics from backend
  const loadClinics = useCallback(async () => {
    setIsLoadingClinics(true);
    try {
      let list = [];
      try {
        const res = await clinicManagementService.getClinicOptions();
        list = res?.clinics || res?.data || (Array.isArray(res) ? res : []);
      } catch (optErr) {
        console.warn('getClinicOptions failed, trying fallback to getClinics:', optErr);
      }

      if (!list || list.length === 0) {
        const fallbackRes = await clinicManagementService.getClinics({ per_page: 100 });
        list = fallbackRes?.data || fallbackRes?.clinics || (Array.isArray(fallbackRes) ? fallbackRes : []);
      }

      const validList = Array.isArray(list) ? list : [];
      setClinics(validList);

      // If exactly 1 clinic exists and not edit mode, auto-select it and its location
      if (!isEditMode && validList.length === 1) {
        const singleClinic = validList[0];
        const locKey = singleClinic.location ? singleClinic.location.trim() : (singleClinic.city ? singleClinic.city.trim() : '');
        setSelectedLocation(locKey);
        setFormData((prev) => ({
          ...prev,
          clinic_id: String(singleClinic.id),
        }));
      }
    } catch (err) {
      console.error('Failed to load clinic options:', err);
      toast.error('Failed to load clinics. Please refresh.');
    } finally {
      setIsLoadingClinics(false);
    }
  }, [isEditMode, toast]);

  // Load staff options for selection
  const loadStaffOptions = useCallback(async () => {
    try {
      const data = await payoutService.getStaffOptions();
      setStaffOptions(data || []);
    } catch (err) {
      console.error('Failed to load staff list:', err);
    }
  }, []);

  // If in edit mode, load existing payout record
  const loadExistingPayout = useCallback(async () => {
    if (!id) return;
    setIsLoadingInitial(true);
    try {
      // Check if passed via location state
      let payoutData = location.state?.payout;
      if (!payoutData) {
        const res = await payoutService.getPayout(id);
        payoutData = res?.payout || res;
      }

      if (payoutData) {
        setExistingPayout(payoutData);
        const staffClinic = payoutData.staff?.clinic;
        const clinicId = staffClinic?.id || payoutData.staff?.clinic_id || '';
        const loc = staffClinic?.location ? staffClinic.location.trim() : (staffClinic?.city ? staffClinic.city.trim() : '');

        setSelectedLocation(loc);
        setFormData({
          clinic_id: clinicId ? String(clinicId) : '',
          staff_id: payoutData.staff_id || '',
          amount: String(payoutData.paid_amount || payoutData.amount || ''),
          payout_date: payoutData.payout_date ? payoutData.payout_date.split('T')[0] : new Date().toISOString().split('T')[0],
          account_type: payoutData.account_type || 'Bank',
          reference_number: payoutData.reference_number || '',
          note: payoutData.note || '',
        });
      }
    } catch (err) {
      console.error('Failed to load existing payout for edit:', err);
      toast.error('Failed to load payout details for editing.');
    } finally {
      setIsLoadingInitial(false);
    }
  }, [id, location.state]);

  useEffect(() => {
    loadClinics();
    loadStaffOptions();
    if (isEditMode) {
      loadExistingPayout();
    }
  }, [loadClinics, loadStaffOptions, loadExistingPayout, isEditMode]);

  // Selected clinic object for showing preview and name
  const selectedClinic = useMemo(() => {
    if (formData.clinic_id) {
      return clinics.find((c) => String(c.id) === String(formData.clinic_id)) || null;
    }
    if (existingPayout?.staff?.clinic) {
      return existingPayout.staff.clinic;
    }
    return null;
  }, [clinics, formData.clinic_id, existingPayout]);

  // Distinct locations derived from active clinics
  const availableLocations = useMemo(() => {
    const map = new Map();
    clinics.forEach((c) => {
      const locKey = c.location ? c.location.trim() : (c.city ? c.city.trim() : '');
      if (locKey && !map.has(locKey)) {
        map.set(locKey, {
          location: locKey,
          city: c.city ? c.city.trim() : '',
          state: c.state ? c.state.trim() : '',
          label: c.city && c.location && c.location !== c.city ? `${c.location} (${c.city})` : locKey,
        });
      }
    });
    // Ensure currently selected location appears in options even before clinics finish loading
    if (selectedLocation && !map.has(selectedLocation)) {
      map.set(selectedLocation, {
        location: selectedLocation,
        city: '',
        state: '',
        label: selectedLocation,
      });
    }
    return Array.from(map.values());
  }, [clinics, selectedLocation]);

  // Search filtered clinics for live search box
  const searchFilteredClinics = useMemo(() => {
    if (!clinicSearchTerm.trim()) return clinics;
    const term = clinicSearchTerm.toLowerCase().trim();
    return clinics.filter((c) => {
      const name = (c.name || '').toLowerCase();
      const branch = (c.branch_name || '').toLowerCase();
      const loc = (c.location || '').toLowerCase();
      const city = (c.city || '').toLowerCase();
      const code = (c.clinic_code || '').toLowerCase();
      return (
        name.includes(term) ||
        branch.includes(term) ||
        loc.includes(term) ||
        city.includes(term) ||
        code.includes(term)
      );
    });
  }, [clinics, clinicSearchTerm]);

  // Filter staff options to those appointed to the selected clinic
  const filteredStaffOptions = useMemo(() => {
    if (!formData.clinic_id) return staffOptions;
    const filtered = staffOptions.filter(
      (s) => String(s.clinic_id) === String(formData.clinic_id) || !s.clinic_id
    );
    // If a staff member is currently selected (e.g. in edit mode), make sure they exist in the options
    if (formData.staff_id && !filtered.some((s) => String(s.id) === String(formData.staff_id))) {
      const currentStaff = staffOptions.find((s) => String(s.id) === String(formData.staff_id));
      if (currentStaff) {
        return [currentStaff, ...filtered];
      }
    }
    return filtered;
  }, [staffOptions, formData.clinic_id, formData.staff_id]);

  // When location is selected: Clinic Name is automatically found and filled!
  const handleLocationSelect = (locKey) => {
    setSelectedLocation(locKey);
    setClinicSearchTerm('');
    setIsSearchDropdownOpen(false);

    if (!locKey) {
      setFormData((prev) => ({
        ...prev,
        clinic_id: '',
        staff_id: '',
        amount: '',
      }));
      return;
    }

    const matched = clinics.filter(
      (c) =>
        (c.location && c.location.trim() === locKey) ||
        (c.city && c.city.trim() === locKey)
    );

    if (matched.length > 0) {
      const selectedId = String(matched[0].id);
      setFormData((prev) => {
        const currentStaff = staffOptions.find((s) => String(s.id) === String(prev.staff_id));
        const staffMatchesClinic = currentStaff && String(currentStaff.clinic_id) === selectedId;
        return {
          ...prev,
          clinic_id: selectedId,
          staff_id: staffMatchesClinic ? prev.staff_id : '',
          amount: staffMatchesClinic ? prev.amount : '',
        };
      });
      if (formErrors.clinic_id) {
        setFormErrors((prev) => ({ ...prev, clinic_id: null }));
      }
    }
  };

  // Direct selection via search suggestion
  const handleClinicSelect = (clinic) => {
    const locKey = clinic.location ? clinic.location.trim() : (clinic.city ? clinic.city.trim() : '');
    if (locKey) {
      setSelectedLocation(locKey);
    }
    setClinicSearchTerm('');
    setIsSearchDropdownOpen(false);

    const clinicId = String(clinic.id);
    setFormData((prev) => {
      const currentStaff = staffOptions.find((s) => String(s.id) === String(prev.staff_id));
      const staffMatchesClinic = currentStaff && String(currentStaff.clinic_id) === clinicId;
      return {
        ...prev,
        clinic_id: clinicId,
        staff_id: staffMatchesClinic ? prev.staff_id : '',
        amount: staffMatchesClinic ? prev.amount : '',
      };
    });
    if (formErrors.clinic_id) {
      setFormErrors((prev) => ({ ...prev, clinic_id: null }));
    }
  };

  // Handle staff member selection
  const handleStaffSelect = (staffId) => {
    const found = staffOptions.find((s) => String(s.id) === String(staffId));
    setFormData((prev) => ({
      ...prev,
      staff_id: staffId,
      amount: !isEditMode && found && found.pending_balance > 0 ? String(found.pending_balance) : prev.amount,
    }));
    if (formErrors.staff_id) {
      setFormErrors((prev) => ({ ...prev, staff_id: null }));
    }
  };

  // Format INR currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(val) || 0);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errors = {};
    if (!formData.clinic_id) {
      errors.clinic_id = 'Please select a location to auto-assign clinic branch.';
    }
    if (!formData.staff_id) {
      errors.staff_id = 'Please select a staff member.';
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      errors.amount = 'Please enter a valid payout amount greater than 0.';
    }
    if (!formData.payout_date) {
      errors.payout_date = 'Please select a payout date.';
    }
    if (!formData.account_type) {
      errors.account_type = 'Please select a payment mode.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        clinic_id: formData.clinic_id,
        staff_id: formData.staff_id,
        amount: Number(formData.amount),
        payout_date: formData.payout_date,
        account_type: formData.account_type,
        reference_number: formData.reference_number?.trim() || null,
        note: formData.note?.trim() || null,
      };

      if (isEditMode) {
        await payoutService.updateStaffPayout(id, payload);
        toast.success(`Staff payout voucher updated successfully!`);
      } else {
        const res = await payoutService.recordStaffPayout(payload);
        const voucherNo = res.payout?.payout_number || '';
        toast.success(
          `Staff payout of ${formatCurrency(formData.amount)} disbursed successfully! Voucher: ${voucherNo}`
        );
      }

      navigate('/superadmin/payouts/staff');
    } catch (err) {
      if (err.response?.data?.errors) {
        setFormErrors(err.response.data.errors);
      } else {
        toast.error(
          err.response?.data?.message ||
            (isEditMode ? 'Failed to update staff payout.' : 'Failed to record staff payout.')
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStaffObj = staffOptions.find((s) => String(s.id) === String(formData.staff_id));

  return (
    <div className="w-full space-y-6 animate-fade-in pb-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap py-0.5">
        <Link to="/superadmin/dashboard" className="hover:text-slate-900 transition-colors">
          Superadmin
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <Link to="/superadmin/payouts/staff" className="text-slate-600 hover:text-slate-900 transition-colors">
          Staff Payouts Register
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-blue-600 font-semibold">
          {isEditMode ? 'Edit Staff Payout' : 'Disburse Staff Payout'}
        </span>
      </nav>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md">
            <UserCheck className="w-5 h-5 drop-shadow-xs" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
              {isEditMode ? `Edit Staff Payout (${existingPayout?.payout_number || id})` : 'Disburse Staff Payout'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Select branch location to auto-load clinic and disburse staff commission or allowance vouchers.
            </p>
          </div>
        </div>

        <Link
          to="/superadmin/payouts/staff"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer self-stretch sm:self-auto shrink-0 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Staff Disbursements</span>
        </Link>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 lg:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-50/60 via-teal-50/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

        <form onSubmit={handleSubmit} className="relative z-10 space-y-6 w-full">
          {/* ======================================================== */}
          {/* STEP 1: LOCATION SELECTION & AUTO-FILLED CLINIC NAME      */}
          {/* ======================================================== */}
          <div className="w-full p-5 sm:p-6 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Location & Clinic Branch Assignment <span className="text-rose-500">*</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">
                {clinics.length} {clinics.length === 1 ? 'Clinic Available' : 'Clinics Available'}
              </span>
            </div>

            {/* Quick Search Box (Location or Clinic Name) */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Quick Search: Type location or clinic name (e.g. Central, Bengaluru, Iniya)..."
                value={clinicSearchTerm}
                onChange={(e) => {
                  setClinicSearchTerm(e.target.value);
                  setIsSearchDropdownOpen(true);
                }}
                onFocus={() => setIsSearchDropdownOpen(true)}
                disabled={isLoadingClinics}
                className="w-full pl-10 pr-9 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 shadow-2xs placeholder:text-slate-400"
              />
              {clinicSearchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setClinicSearchTerm('');
                    setIsSearchDropdownOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Floating Search Dropdown */}
              {isSearchDropdownOpen && clinicSearchTerm.trim() && (
                <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100">
                  {searchFilteredClinics.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No clinics found matching &ldquo;{clinicSearchTerm}&rdquo;
                    </div>
                  ) : (
                    searchFilteredClinics.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleClinicSelect(c)}
                        className={`w-full text-left px-4 py-3 hover:bg-blue-50/80 transition-colors flex items-center justify-between cursor-pointer ${
                          String(formData.clinic_id) === String(c.id) ? 'bg-blue-50 text-blue-900 font-semibold' : 'text-slate-800'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-semibold">{c.name} {c.branch_name ? `(${c.branch_name})` : ''}</p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{c.location || c.city || 'Location N/A'}</span>
                            {c.city && c.location && c.city !== c.location && (
                              <span>&bull; {c.city}</span>
                            )}
                          </p>
                        </div>
                        <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-md bg-slate-100 text-blue-700 font-bold border border-slate-200 shrink-0">
                          {c.clinic_code || `ID: ${c.id}`}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Two Columns: 1. Location Selection -> 2. Clinic Name (Readonly & Auto-Filled) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Location Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>1. Select Location</span> <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => handleLocationSelect(e.target.value)}
                  disabled={isLoadingClinics}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 cursor-pointer font-medium disabled:bg-slate-100 disabled:cursor-not-allowed shadow-2xs"
                >
                  <option value="">-- Choose Location --</option>
                  {availableLocations.map((loc) => (
                    <option key={loc.location} value={loc.location}>
                      {loc.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Selecting a location automatically assigns the associated Clinic Branch.
                </p>
              </div>

              {/* 2. Clinic Name (Auto-filled & Readonly as required) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>2. Clinic Name</span>
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-md border border-slate-300">
                    <Lock className="w-2.5 h-2.5" />
                    Auto-Filled (Readonly)
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={
                      selectedClinic
                        ? `${selectedClinic.name} (${selectedClinic.clinic_code || 'CLN'}) ${selectedClinic.branch_name ? `— ${selectedClinic.branch_name}` : ''}`
                        : selectedLocation
                        ? 'Finding matching clinic branch...'
                        : 'Select Location above to auto-fill clinic'
                    }
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl font-semibold select-none cursor-not-allowed shadow-2xs border ${
                      selectedClinic
                        ? 'bg-blue-50/50 border-blue-200 text-blue-950 font-bold'
                        : 'bg-slate-100 border-slate-200 text-slate-400 italic'
                    }`}
                  />
                  {selectedClinic && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </span>
                  )}
                </div>
                {formErrors.clinic_id && (
                  <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{formErrors.clinic_id}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Selected Clinic Details Auto-Preview Card */}
            {selectedClinic ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-slate-50 border border-blue-200 space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-blue-200/70">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-blue-900">
                      Assigned Clinic Profile Loaded
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-white text-blue-700 border border-blue-200 shadow-2xs">
                    <Lock className="w-3 h-3" />
                    {selectedClinic.clinic_code || 'CLINIC'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                      Clinic / Branch
                    </span>
                    <p className="px-3 py-1.5 bg-white/95 rounded-lg border border-blue-100 text-slate-900 font-semibold truncate text-[11px]">
                      {selectedClinic.name} {selectedClinic.branch_name ? `(${selectedClinic.branch_name})` : ''}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5 flex items-center gap-1">
                      <Compass className="w-3 h-3 text-blue-500" />
                      <span>Location / Area</span>
                    </span>
                    <p className="px-3 py-1.5 bg-white/95 rounded-lg border border-blue-100 text-slate-800 font-medium truncate text-[11px]">
                      {selectedClinic.location || selectedClinic.city || '—'}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-blue-500" />
                      <span>City / State</span>
                    </span>
                    <p className="px-3 py-1.5 bg-white/95 rounded-lg border border-blue-100 text-slate-800 font-medium truncate text-[11px]">
                      {[selectedClinic.city, selectedClinic.state].filter(Boolean).join(', ') || '—'}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-500" />
                      <span>Clinic Address</span>
                    </span>
                    <p className="px-3 py-1.5 bg-white/95 rounded-lg border border-blue-100 text-slate-800 font-medium truncate text-[11px]">
                      {selectedClinic.address || selectedClinic.location || '—'}
                    </p>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-0.5 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-blue-500" />
                      <span>Clinic Contact</span>
                    </span>
                    <p className="px-3 py-1.5 bg-white/95 rounded-lg border border-blue-100 text-slate-800 font-mono text-[11px] truncate">
                      {selectedClinic.phone || selectedClinic.phone_number || selectedClinic.email || '—'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-100/70 border border-dashed border-slate-300 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>Please select a location above to auto-assign the clinic branch and load available staff.</span>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* STEP 2: STAFF MEMBER SELECTION                            */}
          {/* ======================================================== */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Select Staff Beneficiary <span className="text-rose-500">*</span>
              </label>
            </div>

            <select
              value={formData.staff_id}
              onChange={(e) => handleStaffSelect(e.target.value)}
              disabled={!formData.clinic_id}
              className="w-full px-3.5 py-3 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 disabled:bg-slate-100 disabled:cursor-not-allowed cursor-pointer shadow-2xs font-medium"
            >
              <option value="">
                {!formData.clinic_id
                  ? '-- Select Location & Clinic First --'
                  : filteredStaffOptions.length === 0
                  ? '-- No Staff Appointed To This Clinic --'
                  : '-- Choose Staff Member --'}
              </option>
              {filteredStaffOptions.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.staff_code || `ID: ${st.id}`}) &mdash; Commission: ₹{Number(st.total_commission || 0).toLocaleString('en-IN')} {st.pending_balance > 0 ? `(Pending: ₹${Number(st.pending_balance || 0).toLocaleString('en-IN')})` : ''}
                </option>
              ))}
            </select>
            {formErrors.staff_id && (
              <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{formErrors.staff_id}</span>
              </p>
            )}

            {/* Staff Commission Breakdown Banner */}
            {selectedStaffObj && (
              <div className="mt-2.5 p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs animate-in fade-in">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Total Commission</span>
                  <span className="font-bold text-emerald-950 font-mono text-base">
                    {formatCurrency(selectedStaffObj.total_commission)}
                  </span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">Paid So Far</span>
                  <span className="font-bold text-slate-800 font-mono text-base">
                    {formatCurrency(selectedStaffObj.total_paid)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Pending Balance</span>
                  <span className="font-bold text-amber-900 font-mono text-base">
                    {formatCurrency(selectedStaffObj.pending_balance)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* STEP 3: FINANCIAL DETAILS & PAYMENT MODE                  */}
          {/* ======================================================== */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Financial Disbursement Details
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payout Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payout Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-bold text-slate-900 shadow-2xs"
                  />
                </div>
                {formErrors.amount && (
                  <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{formErrors.amount}</span>
                  </p>
                )}
              </div>

              {/* Payout Date */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payout Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.payout_date}
                    onChange={(e) => setFormData({ ...formData, payout_date: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 font-medium shadow-2xs"
                  />
                </div>
                {formErrors.payout_date && (
                  <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{formErrors.payout_date}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Account Type / Payment Mode Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Account Type (Payment Mode) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, account_type: 'Cash' })}
                  className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    formData.account_type === 'Cash'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Cash Drawer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, account_type: 'Bank' })}
                  className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    formData.account_type === 'Bank'
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-400 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Bank (Transfer / UPI)</span>
                </button>
              </div>
              {formErrors.account_type && (
                <p className="text-[11px] text-rose-500 font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{formErrors.account_type}</span>
                </p>
              )}
            </div>

            {/* Reference Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Reference / Transaction No. (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. UTR-98234823, Cheque #01924, Voucher Receipt #321"
                value={formData.reference_number}
                onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-slate-800 shadow-2xs"
              />
            </div>

            {/* Note / Remarks */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Note / Remarks (Optional)
              </label>
              <textarea
                rows="3"
                placeholder="e.g. Monthly commission payout disbursement, clinical consultation allowance, travel reimbursement..."
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800 resize-none shadow-2xs"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200/80 flex items-center justify-end gap-3">
            <Link
              to="/superadmin/payouts/staff"
              className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs hover:shadow transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isEditMode ? 'Updating Payout...' : 'Disbursing Payout...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditMode ? 'Update Payout Voucher' : 'Disburse Payout'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
