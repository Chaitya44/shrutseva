import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BHANDAR_OPTIONS = [
  'Sardar Nagar : Bardoli',
  'Jawahar Nagar : Surat',
  'Main Bhandar : Ahmedabad'
];

export default function BhandarPageSelector() {
  const { isLoggedIn, selectedBhandar, setSelectedBhandar } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isLoggedIn) return null;

  return (
    <div className="relative group shrink-0 w-full sm:w-auto z-30" ref={dropdownRef}>
      <motion.button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        whileHover={{ y: -1, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-between gap-3 px-5 py-2.5 bg-white/95 backdrop-blur-md rounded-full border border-neutral-200 hover:border-[#2563EB] active:scale-[0.98] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_12px_rgba(10,37,64,0.03)] cursor-pointer text-[13px] font-heading font-extrabold text-[#0A2540] w-full sm:w-auto"
      >
        <div className="flex items-center gap-2">
          <MapPin size={15} className="text-[#2563EB]" strokeWidth={2.5} />
          <span>{selectedBhandar}</span>
        </div>
        <ChevronDown size={14} className={`text-[#0A2540] transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      {/* Premium dropdown list */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-full sm:w-[220px] bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-2xl p-2 shadow-[0_10px_30px_rgba(10,37,64,0.08)] flex flex-col gap-1 z-40 origin-top-right overflow-hidden"
          >
            <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Select Bhandar</div>
            {BHANDAR_OPTIONS.map((option) => {
              const isSelected = selectedBhandar === option;
              return (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedBhandar(option);
                    setDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[12.5px] font-bold text-left transition-colors cursor-pointer w-full
                    ${isSelected 
                      ? 'bg-[#2563EB]/10 text-[#2563EB]' 
                      : 'text-[#0A2540] hover:bg-neutral-50'
                    }`}
                >
                  <span className="truncate">{option}</span>
                  {isSelected && <Check size={14} strokeWidth={3} className="shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
