import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Tag,
  Bookmark,
  Boxes,
  Activity,
  Layers,
  Calendar,
  X,
  AlertCircle,
  Building2,
  CheckCircle2,
  Sparkles,
  Lock,
  MapPin,
  Compass,
} from 'lucide-react';
import DataTable from '../../../components/DataTable';
import ConfirmDialog from '../../../components/ConfirmDialog';
import adminInventoryService from '../../../services/adminInventoryService';
import { useToast } from '../../../context/ToastContext';
import { useAdminAuth } from '../../../features/auth/AdminAuthContext';
import { getImageUrl } from '../../../utils/imageUrl';

export default function AdminProductsPage() {
  const toast = useToast();
  const { user } = useAdminAuth();

  const [products, setProducts] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedClinic, setSelectedClinic] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);

  // View modal state
  const [viewProduct, setViewProduct] = useState(null);
  const [viewIndex, setViewIndex] = useState(null);

  // Delete state
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    product: null,
    isLoading: false,
  });

  // Load dropdown filters
  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [clinsRes, cats, brs] = await Promise.all([
          adminInventoryService.getClinicDropdown(),
          adminInventoryService.getCategoryDropdown(),
          adminInventoryService.getBrandDropdown(),
        ]);
        const clins = clinsRes?.clinics || clinsRes || [];
        setClinics(clins);
        setCategories(cats || []);
        setBrands(brs || []);
      } catch {
        // non-blocking
      }
    }
    loadDropdowns();
  }, []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page,
        per_page: 10,
      };
      if (search.trim()) params.search = search.trim();
      if (selectedClinic) params.clinic_id = selectedClinic;
      if (selectedCategory) params.category_id = selectedCategory;
      if (selectedBrand) params.brand_id = selectedBrand;
      if (selectedType) params.product_type = selectedType;
      if (selectedStatus !== 'all') params.status = selectedStatus;

      const res = await adminInventoryService.getProducts(params);
      setProducts(res.data || []);
      setPagination({
        current_page: res.current_page,
        last_page: res.last_page,
        total: res.total,
        from: res.from,
        to: res.to,
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load inventory products.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search, selectedClinic, selectedCategory, selectedBrand, selectedType, selectedStatus, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.product) return;
    setDeleteDialog((prev) => ({ ...prev, isLoading: true }));
    try {
      const res = await adminInventoryService.deleteProduct(deleteDialog.product.id);
      toast.success(res.message || 'Product deleted successfully.');
      setDeleteDialog({ isOpen: false, product: null, isLoading: false });
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete product.');
      setDeleteDialog((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedClinic('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedType('');
    setSelectedStatus('all');
    setPage(1);
  };

  const columns = [
    {
      header: 'SR. NO.',
      className: 'w-[75px] text-center',
      render: (p, index) => {
        const srNo = (pagination?.from || 1) + index;
        return (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-mono text-[11px] font-semibold tabular-numbers">
            {srNo}
          </span>
        );
      },
    },
    {
      header: 'PRODUCT DETAILS',
      className: 'w-[25%]',
      render: (p) => (
        <div className="flex items-center gap-3">
          {p.image_url || p.product_image ? (
            <img
              src={getImageUrl(p.image_url || p.product_image)}
              alt={p.product_name}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200/80 shadow-2xs shrink-0 bg-slate-50"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-2xs shrink-0 icon-3d">
              <Package className="w-5 h-5 drop-shadow-sm" />
            </div>
          )}
          <div className="min-w-0">
            <span className="text-xs font-bold font-display text-slate-900 block truncate">
              {p.product_name}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 font-medium">
              <span>
                Unit: <strong className="text-slate-700 font-semibold font-mono">{p.business_unit} ({p.product_unit ?? 1})</strong>
              </span>
              <span>•</span>
              <span className="font-mono">{new Date(p.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'CLINIC BRANCH',
      className: 'w-[18%]',
      render: (p) => {
        const clinic = p.clinic;
        return (
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-900 block truncate">
              {clinic?.name || 'Iniya Clinic'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 border border-indigo-100/80 text-indigo-700 font-mono text-[10px] font-bold">
                <Lock className="w-2.5 h-2.5 text-indigo-500" />
                {clinic?.clinic_code || (clinic?.id ? `CLN-${String(clinic.id).padStart(4, '0')}` : 'CLN-0001')}
              </span>
              {(clinic?.branch_name || clinic?.location) && (
                <span className="text-[11px] text-slate-400 truncate">
                  {clinic.branch_name || clinic.location}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: 'CATEGORY',
      className: 'w-[14%]',
      render: (p) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60 max-w-full">
          <Tag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">{p.category?.name || 'Unassigned'}</span>
        </span>
      ),
    },
    {
      header: 'BRAND',
      className: 'w-[14%]',
      render: (p) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50/70 text-indigo-700 border border-indigo-200/60 max-w-full">
          <Bookmark className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <span className="truncate">{p.brand?.name || 'Generic / None'}</span>
        </span>
      ),
    },
    {
      header: 'TYPE',
      className: 'w-[12%]',
      render: (p) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/70 font-mono">
          {p.display_product_type}
        </span>
      ),
    },
    {
      header: 'STATUS',
      className: 'w-[10%]',
      render: (p) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
            p.status === 'active'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              p.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
            }`}
          />
          <span className="capitalize">{p.status}</span>
        </span>
      ),
    },
    {
      header: 'ACTIONS',
      className: 'w-[12%] text-right',
      render: (p, index) => {
        const isOwner = Number(p.created_by_admin_id) === Number(user?.id);
        const isInUse = Boolean(p.is_used);

        return (
          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => {
                setViewProduct(p);
                setViewIndex((pagination?.from || 1) + index);
              }}
              className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
              title="View Product"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            {isOwner ? (
              <>
                <Link
                  to={`/admin/inventory/products/${p.id}/edit`}
                  className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                  title="Edit Product"
                >
                  <Edit className="w-3.5 h-3.5" />
                </Link>
                {isInUse ? (
                  <span
                    className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-300 cursor-not-allowed inline-flex items-center"
                    title="Product is in use. Cannot be deleted."
                  >
                    <Trash2 className="w-3.5 h-3.5 opacity-40" />
                  </span>
                ) : (
                  <button
                    onClick={() =>
                      setDeleteDialog({
                        isOpen: true,
                        product: p,
                        isLoading: false,
                      })
                    }
                    className="p-1.5 rounded-xl border border-rose-200 bg-white text-rose-600 hover:text-white hover:bg-rose-600 hover:border-rose-600 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                    title="Delete Product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            ) : (
              <span
                className="p-1.5 rounded-xl text-slate-400 inline-flex items-center cursor-not-allowed"
                title={`Created by ${p.creator?.name || 'another admin'} (Read-only)`}
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Top Clinical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold font-display">
              <Boxes className="w-3.5 h-3.5 text-blue-600" />
              <span>Clinic Supply &amp; Pharmacy Logistics</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold font-display">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Inventory
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight mt-1.5">
            Inventory Products Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5 max-w-2xl leading-relaxed">
            Manage clinic supplies, surgical gear, pharmaceutical stocks, and consumable medical units.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              fetchProducts();
            }}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold font-display transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-98"
            title="Refresh List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            to="/admin/inventory/stocks"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-all shadow-2xs"
            title="Stock Ledger"
          >
            <Boxes className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Stock Ledger</span>
          </Link>

          <Link
            to="/admin/inventory/products/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold font-display shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Create Product</span>
          </Link>
        </div>
      </div>

      {/* Main Table Card (col-12) */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
        {/* Search & Comprehensive Filters (2-Row Layout to prevent squishing) */}
        <div className="space-y-3.5">
          {/* Row 1: Search, Clinic, Category, Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
            {/* Search box */}
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search product name..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all font-normal text-slate-900"
              />
            </div>

            {/* Clinic Branch Filter */}
            <div className="lg:col-span-3">
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedClinic}
                  onChange={(e) => {
                    setSelectedClinic(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium transition-all"
                >
                  <option value="">All Clinics (Branches)</option>
                  {clinics.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.branch_name ? `(${c.branch_name})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category Filter */}
            <div className="lg:col-span-3">
              <div className="relative">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium transition-all"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Brand Filter */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Bookmark className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedBrand}
                  onChange={(e) => {
                    setSelectedBrand(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium transition-all"
                >
                  <option value="">All Brands</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Secondary Quick Filters (Type, Status, Clear) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider micro-label">
                Filter by:
              </span>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-700 font-medium transition-all"
              >
                <option value="">All Types</option>
                <option value="Consumable">Consumable</option>
                <option value="Retail">Retail</option>
                <option value="Equipment">Equipment</option>
                <option value="Medicine">Medicine</option>
                <option value="Service">Service</option>
                <option value="Other">Other</option>
              </select>

              {/* Status Filter */}
              <div className="inline-flex rounded-xl p-0.5 bg-slate-100 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatus('all');
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedStatus === 'all'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All Status
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatus('active');
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedStatus === 'active'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-emerald-700'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStatus('inactive');
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedStatus === 'inactive'
                      ? 'bg-white text-slate-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Inactive
                </button>
              </div>

              {(search || selectedClinic || selectedCategory || selectedBrand || selectedType || selectedStatus !== 'all') && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              )}
            </div>

            {pagination?.total !== undefined && (
              <span className="text-[11px] font-mono text-slate-400">
                Total: <strong className="text-slate-700 font-semibold">{pagination.total}</strong> products
              </span>
            )}
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          columns={columns}
          data={products}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={setPage}
          emptyMessage="No products match your criteria. Click 'Create Product' to add one."
        />
      </div>

      {/* Quick View Product Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 relative overflow-hidden space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                {viewProduct.image_url || viewProduct.product_image ? (
                  <img
                    src={getImageUrl(viewProduct.image_url || viewProduct.product_image)}
                    alt={viewProduct.product_name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 icon-3d">
                    <Package className="w-7 h-7 drop-shadow-sm" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold font-display text-slate-900">
                      {viewProduct.product_name}
                    </h3>
                  </div>
                  {viewIndex && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-mono text-[10px] font-bold mt-1">
                      Sr. No. #{viewIndex}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setViewProduct(null)}
                className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Details Grid */}
            <div className="space-y-4">
              {/* Assigned Clinic Branch Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/20 to-purple-50/20 border border-indigo-100/70">
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-indigo-100/50">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider micro-label flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    Assigned Clinic Branch
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold">
                    <Lock className="w-2.5 h-2.5 text-indigo-500" />
                    {viewProduct.clinic?.clinic_code || (viewProduct.clinic?.id ? `CLN-${String(viewProduct.clinic.id).padStart(4, '0')}` : 'CLN-0001')}
                  </span>
                </div>
                <div className="mt-1.5">
                  <div className="text-xs font-bold text-slate-800">
                    {viewProduct.clinic?.name || 'Iniya Aesthetics & Wellness'}
                    {viewProduct.clinic?.branch_name && (
                      <span className="text-indigo-600 font-semibold ml-1.5">• {viewProduct.clinic.branch_name}</span>
                    )}
                  </div>
                  {(viewProduct.clinic?.location || viewProduct.clinic?.city) && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <Compass className="w-3 h-3 text-indigo-400" />
                      <span>{[viewProduct.clinic.location, viewProduct.clinic.city].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider micro-label">
                    Category
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    <span>{viewProduct.category?.name || 'Unassigned'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider micro-label">
                    Brand
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{viewProduct.brand?.name || 'Generic / None'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider micro-label">
                    Business Unit
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1 font-mono">
                    {viewProduct.business_unit} ({viewProduct.product_unit ?? 1})
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider micro-label">
                    Alert Threshold
                  </div>
                  <div className="text-xs font-bold text-amber-700 mt-1 font-mono">
                    &le; {viewProduct.low_stock_threshold ?? 10} {viewProduct.business_unit}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 sm:col-span-2">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider micro-label">
                    Product Type
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1">
                    {viewProduct.display_product_type}
                  </div>
                </div>
              </div>

              {/* Status and Creator Info */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500">
                    Enrolled by Administrator
                  </div>
                  <div className="text-xs font-bold text-blue-900 mt-0.5">
                    {viewProduct.creator?.name || 'Clinic Administrator'}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                    viewProduct.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      viewProduct.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  <span className="capitalize">{viewProduct.status}</span>
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-100">
              <button
                onClick={() => setViewProduct(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold font-display text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
              {Number(viewProduct.created_by_admin_id) === Number(user?.id) && (
                <Link
                  to={`/admin/inventory/products/${viewProduct.id}/edit`}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold font-display shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
                >
                  Edit Product
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        title="Delete Inventory Product?"
        message={`Are you sure you want to delete '${deleteDialog.product?.product_name}'? It will be removed from active clinic inventory.`}
        confirmText={deleteDialog.isLoading ? 'Deleting...' : 'Yes, Delete Product'}
        confirmVariant="danger"
        isLoading={deleteDialog.isLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialog({ isOpen: false, product: null, isLoading: false })}
      />
    </div>
  );
}
