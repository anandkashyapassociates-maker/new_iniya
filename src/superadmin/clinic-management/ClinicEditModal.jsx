import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import ClinicForm from './ClinicForm';
import clinicManagementService from '../services/clinicManagementService';
import { useToast } from '../../context/ToastContext';

export default function ClinicEditModal({ isOpen, onClose, clinic, onSuccess }) {
  const toast = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen || !clinic) return null;

  const handleUpdate = async (formData) => {
    setIsUpdating(true);
    try {
      await clinicManagementService.updateClinic(clinic.id, formData);
      toast.success(`Clinic '${formData.name}' updated successfully!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating clinic:', err);
      const msg = err.response?.data?.message || 'Failed to update clinic record.';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden my-6 z-10 animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-600 text-white flex items-center justify-center icon-3d shadow-md shrink-0">
              <Building2 className="w-5 h-5 drop-shadow-sm" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-slate-900">
                Edit Clinic: {clinic.name}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {clinic.clinic_code} • {clinic.location}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          <ClinicForm
            initialData={clinic}
            onSubmit={handleUpdate}
            isLoading={isUpdating}
            isEdit={true}
            cancelPath="#"
          />
        </div>
      </div>
    </div>
  );
}
