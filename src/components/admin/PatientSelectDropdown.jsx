import React, { useState, useRef, useEffect, useMemo } from 'react';
import { User, ChevronDown, Check, X, Search } from 'lucide-react';

export default function PatientSelectDropdown({
  patients = [],
  value = '',
  onChange,
  placeholder = '-- Select Patient --',
  placement = 'auto',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const focusTimer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 30);

    if (placement === 'top') {
      setOpenUpward(true);
      return () => clearTimeout(focusTimer);
    }
    if (placement === 'bottom') {
      setOpenUpward(false);
      return () => clearTimeout(focusTimer);
    }

    const checkPlacement = () => {
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        if (spaceBelow < 300 && spaceAbove > spaceBelow) {
          setOpenUpward(true);
        } else {
          setOpenUpward(false);
        }
      }
    };

    checkPlacement();
    window.addEventListener('resize', checkPlacement);
    window.addEventListener('scroll', checkPlacement, true);
    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('resize', checkPlacement);
      window.removeEventListener('scroll', checkPlacement, true);
    };
  }, [isOpen, placement]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPatients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (c) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.mobile && String(c.mobile).toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [patients, search]);

  const selectedPatient = useMemo(() => {
    return patients.find((c) => String(c.id) === String(value)) || null;
  }, [patients, value]);

  const handleSelect = (id) => {
    onChange(String(id));
    setIsOpen(false);
    setSearch('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setSearch('');
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className="w-full px-3.5 py-2.5 sm:px-4 sm:py-3 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/90 rounded-xl sm:rounded-2xl flex items-center justify-between cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all select-none shadow-xs"
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
          <User className="w-4 h-4 text-slate-400 shrink-0" />
          {selectedPatient ? (
            <span className="text-xs sm:text-sm text-slate-800 font-medium truncate">
              {selectedPatient.name}
              {selectedPatient.mobile ? ` (${selectedPatient.mobile})` : ''}
              {selectedPatient.gender ? ` • ${selectedPatient.gender}` : ''}
            </span>
          ) : (
            <span className="text-xs sm:text-sm text-slate-400 font-normal truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedPatient && (
            <button
              type="button"
              onClick={handleClear}
              title="Clear selected patient"
              className="p-0.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-50 w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden ${
            openUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
          }`}
        >
          {/* Search Input */}
          <div className="p-2.5 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                placeholder="Search patient by name or mobile..."
                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearch('');
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 px-1">
              <span>
                {filteredPatients.length}{' '}
                {filteredPatients.length === 1 ? 'patient' : 'patients'} available
              </span>
              {selectedPatient && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-rose-600 hover:underline font-medium cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Patient Options List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
            {filteredPatients.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs sm:text-sm text-slate-400">
                No matching patients found.
              </div>
            ) : (
              filteredPatients.map((c) => {
                const isSelected = String(c.id) === String(value);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelect(c.id)}
                    className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/80 text-blue-900'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs sm:text-sm font-semibold truncate">
                        {c.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {c.mobile || 'No mobile'}
                        {c.gender ? ` • ${c.gender}` : ''}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
