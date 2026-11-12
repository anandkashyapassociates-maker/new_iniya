import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Phone,
  Mail,
  AlertCircle,
  Pencil,
  Hash,
  MapPin,
  Layers,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
} from 'lucide-react';
import ClinicStatusBadge from './ClinicStatusBadge';
import ClinicEditModal from './ClinicEditModal';
import clinicManagementService from '../services/clinicManagementService';
import { useToast } from '../../context/ToastContext';

export default function ClinicDetailsPage() {
  const toast = useToast();

  const [clinicList, setClinicList] = useState([]);
  const [locationsData, setLocationsData] = useState({ cities: [], locations: [] });
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & search state
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Edit modal state
  const [selectedClinicForEdit, setSelectedClinicForEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Delete modal state
  const [clinicToDelete, setClinicToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchClinics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await clinicManagementService.getClinics({
        search: activeSearch,
        status: statusFilter,
        city: cityFilter !== 'all' ? cityFilter : undefined,
        page,
        per_page: perPage,
        sort_by: 'created_at',
        sort_direction: 'desc',
      });

      setClinicList(res.data || []);
      setPagination({
        current_page: res.current_page || 1,
        last_page: res.last_page || 1,
        total: res.total || 0,
        from: res.from || 0,
        to: res.to || 0,
        per_page: res.per_page || perPage,
      });
    } catch (err) {
      console.error('Error fetching clinics:', err);
      setError('Unable to load clinic records. Please check database connectivity.');
      toast.error('Failed to load clinic records.');
    } finally {
      setIsLoading(false);
    }
  }, [activeSearch, statusFilter, cityFilter, page, perPage, toast]);

  // Load locations and cities for filter
  useEffect(() => {
    clinicManagementService
      .getLocations()
      .then((data) => {
        if (data) {
          setLocationsData({
            cities: data.cities || [],
            locations: data.locations || [],
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchInput.trim());
  };

  const handleStatusToggle = async (clinic) => {
    const nextStatus = clinic.status === 'active' ? 'inactive' : 'active';
    try {
      await clinicManagementService.updateClinicStatus(clinic.id, nextStatus);
      toast.success(
        `Clinic '${clinic.name}' status set to ${nextStatus === 'active' ? 'Operational' : 'Inactive'}.`
      );
      fetchClinics();
    } catch (err) {
      console.error('Error toggling clinic status:', err);
      toast.error('Failed to change clinic status.');
    }
  };

  const handleDeleteClinic = async () => {
    if (!clinicToDelete) return;
    setIsDeleting(true);
    try {
      await clinicManagementService.deleteClinic(clinicToDelete.id);
      toast.success(`Clinic '${clinicToDelete.name}' deleted successfully.`);
      setClinicToDelete(null);
      fetchClinics();
    } catch (err) {
      console.error('Error deleting clinic:', err);
      toast.error('Failed to delete clinic.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics summary
  const totalClinics = pagination?.total || clinicList.length;
  const activeCount = clinicList.filter((c) => c.status === 'active').length;
  const inactiveCount = clinicList.filter((c) => c.status !== 'active').length;

  return (
    <div className="w-full space-y-6 animate-fade-in font-sans">
      {/* 1. Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium overflow-x-auto whitespace-nowrap py-0.5">
        <Link to="/superadmin/dashboard" className="hover:text-slate-900 transition-colors">
          Superadmin
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-slate-600 font-semibold">Clinic Management</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-blue-600 font-semibold">Clinic Details &amp; Directory</span>
      </nav>

      {/* 2. Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-cyan-600 text-white flex items-center justify-center shrink-0 icon-3d shadow-md hover:scale-105 transition-all duration-300">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-sm" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-lg sm:text-xl font-bold font-display text-slate-900 tracking-tight">
                  Clinic Directory &amp; Branch Network
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                  Multi-Clinic Architecture
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized management of physical clinics, branch locations, operational status, and contact registry.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={fetchClinics}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/superadmin/clinics/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Provision New Clinic</span>
          </Link>
        </div>
      </div>

      {/* 3. KPI Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Registered Clinics */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Clinics Network
            </span>
            <div className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight mt-1">
              {totalClinics}
            </div>
            <span className="text-xs text-slate-400 mt-0.5 block">Branches registered</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center icon-3d shadow-2xs">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 2: Operational Clinics */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
              Operational Clinics
            </span>
            <div className="text-2xl font-extrabold text-emerald-700 font-sans tracking-tight mt-1">
              {activeCount}
            </div>
            <span className="text-xs text-emerald-600 font-medium mt-0.5 block">Active consultation desks</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center icon-3d shadow-2xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Inactive / Maintenance */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
              Inactive / Maintenance
            </span>
            <div className="text-2xl font-extrabold text-amber-700 font-sans tracking-tight mt-1">
              {inactiveCount}
            </div>
            <span className="text-xs text-amber-600 font-medium mt-0.5 block">Suspended / offline</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center icon-3d shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4. Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input Form */}
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by clinic name, code (CLN-XXXX), location, address, phone..."
              className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl pl-10 pr-20 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filter Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none cursor-pointer hover:border-slate-300"
          >
            <option value="all">All Statuses</option>
            <option value="active">Operational Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="maintenance">Under Maintenance</option>
          </select>

          {/* City Filter */}
          {locationsData.cities.length > 0 && (
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setPage(1);
              }}
              className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none cursor-pointer hover:border-slate-300"
            >
              <option value="all">All Cities</option>
              {locationsData.cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          )}

          {/* Per Page */}
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              setPage(1);
            }}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none cursor-pointer hover:border-slate-300"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* 5. Clinic Data Table Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-medium">Loading clinic branches...</p>
          </div>
        ) : error ? (
          <div className="py-16 px-6 text-center">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">{error}</p>
            <button
              onClick={fetchClinics}
              className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : clinicList.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Clinics Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {activeSearch || statusFilter !== 'all' || cityFilter !== 'all'
                ? 'No clinics match the current filter criteria. Try resetting the search or filter.'
                : 'No clinic records exist yet. Start by provisioning your first clinic branch.'}
            </p>
            <Link
              to="/superadmin/clinics/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Clinic</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 select-none">
                  <th className="py-3.5 px-4 sm:px-6">Clinic Code</th>
                  <th className="py-3.5 px-4">Clinic &amp; Branch</th>
                  <th className="py-3.5 px-4">Location &amp; Address</th>
                  <th className="py-3.5 px-4">Contact Details</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {clinicList.map((clinic) => (
                  <tr
                    key={clinic.id}
                    className="hover:bg-blue-50/20 transition-colors group"
                  >
                    {/* 1. Clinic Code */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap font-mono font-bold text-slate-900">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-blue-700 font-mono text-[11px]">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        <span>{clinic.clinic_code}</span>
                      </div>
                    </td>

                    {/* 2. Clinic Name & Branch */}
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {clinic.name}
                      </div>
                      {clinic.branch_name && (
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span>{clinic.branch_name}</span>
                        </div>
                      )}
                      {clinic.contact_person && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          In-charge: <span className="text-slate-600 font-medium">{clinic.contact_person}</span>
                        </div>
                      )}
                    </td>

                    {/* 3. Location & Address */}
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{clinic.location}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {clinic.address}
                        {clinic.city ? `, ${clinic.city}` : ''}
                        {clinic.postal_code ? ` - ${clinic.postal_code}` : ''}
                      </div>
                    </td>

                    {/* 4. Contact Details */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{clinic.phone}</span>
                      </div>
                      {clinic.email && (
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{clinic.email}</span>
                        </div>
                      )}
                    </td>

                    {/* 5. Status Badge */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <ClinicStatusBadge status={clinic.status} />
                    </td>

                    {/* 6. Actions */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Status Toggle Quick Button */}
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(clinic)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                            clinic.status === 'active'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          }`}
                          title={clinic.status === 'active' ? 'Deactivate Clinic' : 'Activate Clinic'}
                        >
                          {clinic.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedClinicForEdit(clinic);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer"
                          title="Edit Clinic"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setClinicToDelete(clinic)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition-all cursor-pointer"
                          title="Delete Clinic"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. Pagination Footer */}
        {pagination && pagination.total > 0 && (
          <div className="px-4 sm:px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-bold text-slate-800">{pagination.from}</span> to{' '}
              <span className="font-bold text-slate-800">{pagination.to}</span> of{' '}
              <span className="font-bold text-slate-800">{pagination.total}</span> clinics
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.current_page <= 1}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>

              <div className="px-3 py-1 text-xs font-bold text-slate-700">
                Page {pagination.current_page} of {pagination.last_page}
              </div>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                disabled={pagination.current_page >= pagination.last_page}
                className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 font-bold text-xs inline-flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 7. Edit Clinic Modal */}
      {isEditModalOpen && selectedClinicForEdit && (
        <ClinicEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedClinicForEdit(null);
          }}
          clinic={selectedClinicForEdit}
          onSuccess={fetchClinics}
        />
      )}

      {/* 8. Delete Confirmation Modal */}
      {clinicToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setClinicToDelete(null)}
          />
          <div className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200/90 z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto icon-3d shadow-xs">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Delete Clinic Branch?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <span className="font-bold text-slate-800">'{clinicToDelete.name}'</span> ({clinicToDelete.clinic_code})?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setClinicToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteClinic}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
