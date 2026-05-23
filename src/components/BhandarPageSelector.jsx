import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, Check, Loader2, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BhandarPageSelector() {
  const { isLoggedIn, selectedBhandar, setSelectedBhandar, bhandarList, bhandarsLoading, isAdmin, lockedBhandar } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isLoggedIn) return null;

  // ── Non-admin: show a locked static badge, no dropdown ──────────────
  if (!isAdmin && lockedBhandar) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full border border-neutral-200 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_12px_rgba(10,37,64,0.03)]">
        <MapPin size={15} className="text-[#2563EB] shrink-0" strokeWidth={2.5} />
        <span className="text-[13px] font-heading font-extrabold text-[#0A2540] truncate max-w-[180px]">
          {lockedBhandar.label}
        </span>
        <Lock size={13} className="text-neutral-400 shrink-0" strokeWidth={2.5} />
      </div>
    );
  }

  // ── Admin: full dropdown with all bhandars ───────────────────────────
  const filtered = bhandarList.filter(b =>
    b && b.label && b.label.toLowerCase().includes(search.toLowerCase())
  );

  const displayLabel = selectedBhandar || 'Select Bhandar';

  return (
    <div className="relative group shrink-0 w-full sm:w-auto z-30" ref={dropdownRef}>
      <motion.button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        whileHover={{ y: -1, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-between gap-3 px-5 py-2.5 bg-white/95 backdrop-blur-md rounded-full border border-neutral-200 hover:border-[#2563EB] active:scale-[0.98] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_12px_rgba(10,37,64,0.03)] cursor-pointer text-[13px] font-heading font-extrabold text-[#0A2540] w-full sm:w-auto"
      >
        <div className="flex items-center gap-2">
          {bhandarsLoading ? (
            <Loader2 size={14} className="text-[#2563EB] animate-spin" />
          ) : (
            <MapPin size={15} className="text-[#2563EB]" strokeWidth={2.5} />
          )}
          <span className="truncate max-w-[160px] sm:max-w-[200px]">{displayLabel}</span>
        </div>
        <ChevronDown size={14} className={`text-[#0A2540] transition-transform duration-300 shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-full sm:w-[280px] bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-2xl shadow-[0_10px_30px_rgba(10,37,64,0.08)] flex flex-col z-40 origin-top-right overflow-hidden"
          >
            {/* Header */}
            <div className="px-3 pt-3 pb-2 text-[10px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
              Select Bhandar ({bhandarList.length})
            </div>

            {/* Search */}
            <div className="px-2 pt-2">
              <input
                type="text"
                placeholder="Search bhandar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
                className="w-full px-3 py-1.5 text-[12px] rounded-lg border border-neutral-200 focus:border-[#2563EB] focus:outline-none text-[#0A2540] placeholder-neutral-400 font-medium"
              />
            </div>

            {/* Options */}
            <div className="flex flex-col gap-0.5 p-2 max-h-[240px] overflow-y-auto">
              {bhandarsLoading ? (
                <div className="flex items-center justify-center py-4 gap-2 text-neutral-400 text-[12px]">
                  <Loader2 size={14} className="animate-spin" /> Loading...
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-4 text-center text-[12px] text-neutral-400">No results found</div>
              ) : filtered.map((option) => {
                const isSelected = selectedBhandar === option.value;
                return (
                  <button
                    key={option.code || option.value}
                    onClick={() => {
                      setSelectedBhandar(option.value);
                      setDropdownOpen(false);
                      setSearch('');
                    }}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer w-full
                      ${isSelected
                        ? 'bg-[#2563EB]/10 text-[#2563EB]'
                        : 'text-[#0A2540] hover:bg-neutral-50'
                      }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-bold truncate">{option.label}</div>
                      {option.name && (
                        <div className="text-[10px] text-neutral-400 font-medium truncate">{option.name}</div>
                      )}
                    </div>
                    {isSelected && <Check size={14} strokeWidth={3} className="shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
