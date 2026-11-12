import React, { useState, useEffect, useCallback } from 'react';
import {
  Boxes,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Package,
  Layers,
  X,
  AlertCircle,
  CheckCircle2,
  Calendar,
  UserCheck,
  ShieldAlert,
  Sparkles,
  Tag,
  Bookmark,
  Building2,
  Lock,
  Compass,
} from 'lucide-react';
import DataTable from '../../components/DataTable';
import superAdminInventoryService from '../services/superAdminInventoryService';
import { useToast } from '../../context/ToastContext';
import { getImageUrl } from '../../utils/imageUrl';

export default function SuperAdminProductsPage() {
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [clinicFilter, setClinicFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);

  // View modal state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Load dropdown options for filters
  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [clinsRes, catsRes, brsRes] = await Promise.all([
          superAdminInventoryService.getClinics(),
          superAdminInventoryService.getCategories({ per_page: 100 }),
          superAdminInventoryService.getBrands({ per_page: 100 }),
        ]);
        setClinics(clinsRes?.clinics || clinsRes || []);
        setCategories(catsRes.data || []);
        setBrands(brsRes.data || []);
      } catch {
        // Non-blocking
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
      if (clinicFilter !== 'all') params.clinic_id = clinicFilter;
      if (categoryFilter !== 'all') params.category_id = categoryFilter;
      if (brandFilter !== 'all') params.brand_id = brandFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.product_type = typeFilter;

      const res = await superAdminInventoryService.getProducts(params);
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
  }, [page, search, clinicFilter, categoryFilter, brandFilter, statusFilter, typeFilter, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);


  const handleResetFilters = () => {
    setSearch('');
    setClinicFilter('all');
    setCategoryFilter('all');
    setBrandFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
    setPage(1);
  };

  const columns = [
    {
      header: 'SR. NO.',
      className: 'w-[75px] text-center',
      render: (product, index) => {
        const srNo = (pagination?.from || 1) + index;
        return (
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-mono text-[11px] font-semibold tabular-numbers">
            {srNo}
          </span>
        );
      },
    },
    {
      header: 'PRODUCT SPECIFICATIONS',
      className: 'w-[23%]',
      render: (product) => (
        <div className="flex items-center gap-3">
          {product.image_url || product.product_image ? (
            <img
              src={getImageUrl(product.image_url || product.product_image)}
              alt={product.product_name}
              className="w-11 h-11 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0 bg-slate-50"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-2xs shrink-0 icon-3d">
              <Package className="w-5 h-5 drop-shadow-sm" />
            </div>
          )}
          <div className="min-w-0">
            <span className="text-xs font-bold font-display text-slate-900 block truncate">
              {product.product_name}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] text-slate-400 font-medium">
                Unit: <span className="text-slate-700 font-semibold font-mono">{product.business_unit} ({product.product_unit ?? 1})</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60 font-mono">
                {product.display_product_type || product.product_type}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'CLINIC BRANCH',
      className: 'w-[17%]',
      render: (product) => {
        const clinic = product.clinic;
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
      render: (product) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60 max-w-full">
          <Tag className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">{product.category?.name || 'Unassigned'}</span>
        </span>
      ),
    },
    {
      header: 'BRAND',
      className: 'w-[14%]',
      render: (product) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 max-w-full">
          <Bookmark className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="truncate">{product.brand?.name || 'Generic / None'}</span>
        </span>
      ),
    },
    {
      header: 'CATALOGED BY ADMIN',
      className: 'w-[18%]',
      render: (product) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
            {product.creator?.name ? product.creator.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-semibold text-slate-800 block truncate">
              {product.creator?.name || 'Clinic Admin'}
            </span>
            <span className="text-[10px] font-mono text-slate-400 block truncate">
              {product.creator?.email || 'admin@clinic.local'}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'STATUS',
      className: 'w-[12%] text-center',
      render: (product) => (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border ${
            product.status === 'active'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              product.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
            }`}
          />
          <span className="capitalize">{product.status}</span>
        </span>
      ),
    },
    {
      header: 'ACTIONS',
      className: 'w-[10%] text-right',
      render: (product, index) => (
        <div className="flex items-center justify-end">
          <button
            onClick={() => {
              setSelectedProduct(product);
              setSelectedIndex((pagination?.from || 1) + index);
            }}
            className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
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
              <span>Global Product Registry</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold font-display">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Clinic Feeds
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight mt-1.5">
            All Inventory Products
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5 max-w-2xl leading-relaxed">
            Superadmin master catalog with real-time clinic admin attribution, status toggles, and edit controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => fetchProducts()}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold font-display transition-all shadow-2xs hover:shadow-xs cursor-pointer active:scale-98"
            title="Refresh List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Table Card (col-12) */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
        {/* Search & Comprehensive Filters (2-Row Clean Layout) */}
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
                placeholder="Search products by name, code, brand, admin..."
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all font-normal text-slate-900"
              />
            </div>

            {/* Clinic Branch Filter */}
            <div className="lg:col-span-3">
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={clinicFilter}
                  onChange={(e) => {
                    setClinicFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium transition-all"
                >
                  <option value="all">All Clinics (Branches)</option>
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
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium transition-all"
                >
                  <option value="all">All Categories</option>
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
                  value={brandFilter}
                  onChange={(e) => {
                    setBrandFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-slate-700 font-medium transition-all"
                >
                  <option value="all">All Brands</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Secondary Quick Filters (Type, Status, Reset) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider micro-label">
                Filter by:
              </span>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-700 font-medium transition-all"
              >
                <option value="all">All Types</option>
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
                    setStatusFilter('all');
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  All Status
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('active');
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'active'
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
                    setStatusFilter('inactive');
                    setPage(1);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'inactive'
                      ? 'bg-white text-slate-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Inactive
                </button>
              </div>

              {(search || clinicFilter !== 'all' || categoryFilter !== 'all' || brandFilter !== 'all' || typeFilter !== 'all' || statusFilter !== 'all') && (
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
          emptyMessage="No products match your criteria."
        />
      </div>

      {/* Quick View Product Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 relative overflow-hidden space-y-6">
            <div className="flex items-start justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                {selectedProduct.image_url || selectedProduct.product_image ? (
                  <img
                    src={getImageUrl(selectedProduct.image_url || selectedProduct.product_image)}
                    alt={selectedProduct.product_name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-xs shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 icon-3d shrink-0">
                    <Package className="w-7 h-7 drop-shadow-sm" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900">
                    {selectedProduct.product_name}
                  </h3>
                  {selectedIndex && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-mono text-[10px] font-bold mt-1">
                      Sr. No. #{selectedIndex}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Assigned Clinic Branch Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-50 via-indigo-50/20 to-purple-50/20 border border-indigo-100/70">
                <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-indigo-100/50">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider micro-label flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    Assigned Clinic Branch
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-mono text-[10px] font-bold">
                    <Lock className="w-2.5 h-2.5 text-indigo-500" />
                    {selectedProduct.clinic?.clinic_code || (selectedProduct.clinic?.id ? `CLN-${String(selectedProduct.clinic.id).padStart(4, '0')}` : 'CLN-0001')}
                  </span>
                </div>
                <div className="mt-1.5">
                  <div className="text-xs font-bold text-slate-800">
                    {selectedProduct.clinic?.name || 'Iniya Aesthetics & Wellness'}
                    {selectedProduct.clinic?.branch_name && (
                      <span className="text-indigo-600 font-semibold ml-1.5">• {selectedProduct.clinic.branch_name}</span>
                    )}
                  </div>
                  {(selectedProduct.clinic?.location || selectedProduct.clinic?.city) && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <Compass className="w-3 h-3 text-indigo-400" />
                      <span>{[selectedProduct.clinic.location, selectedProduct.clinic.city].filter(Boolean).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 micro-label">
                    Category
                  </span>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600" />
                    <span>{selectedProduct.category?.name || 'None'}</span>
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 micro-label">
                    Brand
                  </span>
                  <p className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedProduct.brand?.name || 'None'}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 micro-label">
                    Business Unit
                  </span>
                  <p className="font-bold text-slate-900 font-mono">
                    {selectedProduct.business_unit} ({selectedProduct.product_unit ?? 1})
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 micro-label">
                    Alert Threshold
                  </span>
                  <p className="font-bold text-amber-700 font-mono">
                    &le; {selectedProduct.low_stock_threshold ?? 10} {selectedProduct.business_unit}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 micro-label">
                  Product Type
                </span>
                <p className="font-bold text-slate-900">
                  {selectedProduct.display_product_type || selectedProduct.product_type}
                </p>
              </div>

              {selectedProduct.creator && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-blue-900 block">
                      Cataloged by {selectedProduct.creator.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 block truncate">
                      {selectedProduct.creator.email}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-slate-100">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold font-display text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
