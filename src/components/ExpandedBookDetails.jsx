import React, { useState } from 'react';
import {
  ChevronLeft, ChevronRight, ArrowRight, BookOpen, Layers, Type, PenTool,
  User, Edit3, Globe, Building2, FileText, Calendar, Bookmark, ShieldCheck,
  ClipboardList, List, BookCheck, RotateCcw, Pencil, Trash2, X, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/** Desktop card — keeps icon + truncation-free value */
const DetailCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-white/60 flex items-start gap-3 sm:gap-4 hover:shadow-[0_8px_24px_rgba(0,182,190,0.1)] transition-all duration-300">
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0 border border-blue-100 shadow-inner">
      <Icon size={15} className="text-[#0D47A1]" strokeWidth={2.5} />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[9.5px] sm:text-[11px] font-bold text-[#0D47A1] uppercase tracking-wider mb-0.5 sm:mb-1">{label}</span>
      <span className="text-[12px] sm:text-[13px] font-semibold text-neutral-800 leading-snug break-words">{value || '-'}</span>
    </div>
  </div>
);

/** Mobile row — single column, no card box, full-width text wraps naturally */
const MobileRow = ({ icon: Icon, label, value }) => {
  if (!value || value === '-') return null; // hide empty rows on mobile to save space
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-neutral-100 last:border-0">
      <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-[#0D47A1]" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="block text-[10px] font-bold text-[#0D47A1] uppercase tracking-wider mb-0.5">{label}</span>
        <span className="block text-[13px] font-semibold text-neutral-800 leading-snug break-words whitespace-pre-wrap">{value}</span>
      </div>
    </div>
  );
};


const mapLanguageInitialToFull = (initial) => {
  if (!initial) return '-';
  const val = initial.trim();
  const results = [];
  if (/[Ggગુ]/u.test(val)) results.push('Gujarati');
  if (/[HhહિહDd]/u.test(val)) results.push('Hindi');
  if (/[Ssસં]/u.test(val)) results.push('Sanskrit');
  if (/[Ppપ્રા]/u.test(val)) results.push('Prakrit');
  if (/[Eeઅંઇ]/u.test(val) || val.toLowerCase().includes('english')) results.push('English');
  return results.length > 0 ? results.join(', ') : initial;
};

/** Book Numbers modal — shown when admin clicks Issue/Return/Edit/Delete on a bhandar row */
function BookNumbersModal({ bhandars, onClose }) {
  const [selected, setSelected] = useState([]);
  const [actionState, setActionState] = useState(null); // null | 'issuing' | 'returning' | 'success' | 'error'
  const [actionType, setActionType] = useState('');

  const toggle = (bookNumber) => {
    setSelected(prev =>
      prev.includes(bookNumber) ? prev.filter(x => x !== bookNumber) : [...prev, bookNumber]
    );
  };

  const doAction = async (type, endpoint) => {
    if (!selected.length) return;
    setActionType(type);
    setActionState('issuing');
    try {
      const ids = selected.join(',');
      const res = await fetch(`/front/${endpoint}/${encodeURIComponent(ids)}`, {
        credentials: 'same-origin',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (res.ok) setActionState('success');
      else setActionState('error');
    } catch (e) {
      setActionState('error');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-[3px] z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 16 }}
        transition={{ type: 'spring', stiffness: 340, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] border border-neutral-100 w-full max-w-[440px] overflow-hidden"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h3 className="text-[15px] font-extrabold text-[#012c77]">Book Numbers</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 cursor-pointer">
            <X size={15} />
          </button>
        </div>

        {/* Book number checkboxes */}
        <div className="px-5 py-4 flex flex-col gap-2 max-h-[220px] overflow-y-auto">
          {bhandars.map((b, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${selected.includes(b.bookNumber) ? 'bg-[#012c77] border-[#012c77]' : 'border-neutral-300 group-hover:border-[#012c77]'}`}>
                {selected.includes(b.bookNumber) && <Check size={12} strokeWidth={3} className="text-white" />}
              </span>
              <input type="checkbox" className="sr-only" checked={selected.includes(b.bookNumber)} onChange={() => toggle(b.bookNumber)} />
              <span className="text-[13px] font-bold text-neutral-700">{b.bookNumber}</span>
              {b.name && <span className="text-[11px] text-neutral-400 truncate">{b.name}</span>}
            </label>
          ))}
          {bhandars.length === 0 && (
            <p className="text-[13px] text-neutral-400 text-center py-4">No book numbers available</p>
          )}
        </div>

        {/* Success / error feedback */}
        <AnimatePresence>
          {actionState === 'success' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-5 mb-3 px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[13px] font-bold text-emerald-700">
              ✓ {actionType} successful for: {selected.join(', ')}
            </motion.div>
          )}
          {actionState === 'error' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mx-5 mb-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-[13px] font-bold text-red-700">
              ✗ Action failed. Please try again.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons — Return | Issue | Edit | Delete | Close */}
        <div className="flex items-center gap-2 px-5 py-4 border-t border-neutral-100 flex-wrap">
          <button
            onClick={() => doAction('Return', 'quick_search_return')}
            disabled={!selected.length || actionState === 'issuing'}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold bg-[#012c77] text-white disabled:opacity-40 hover:bg-[#01237a] transition-colors cursor-pointer shadow-sm"
          >
            <RotateCcw size={13} /> Return
          </button>
          <button
            onClick={() => doAction('Issue', 'quick_search_issue')}
            disabled={!selected.length || actionState === 'issuing'}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold bg-[#FF6B00] text-white disabled:opacity-40 hover:bg-[#e55f00] transition-colors cursor-pointer shadow-sm"
          >
            <BookCheck size={13} /> Issue
          </button>
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <Pencil size={13} /> Edit
          </button>
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
          >
            <Trash2 size={13} /> Delete
          </button>
          <button onClick={onClose} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold bg-neutral-200 text-neutral-700 hover:bg-neutral-300 transition-colors cursor-pointer ml-auto">
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ExpandedBookDetails({ book, isAdmin }) {
  const [showModal, setShowModal] = useState(false);

  const details = [
    { icon: BookOpen, label: 'Name', value: book?.name },
    { icon: Layers, label: 'Part', value: book?.part },
    { icon: Type, label: 'Alternate Name', value: book?.alternateName },
    { icon: PenTool, label: 'Kruti', value: book?.kruti },
    { icon: User, label: 'Author', value: book?.author },
    { icon: Edit3, label: 'Editor', value: book?.editor },
    { icon: Globe, label: 'Language', value: mapLanguageInitialToFull(book?.languageFull) },
    { icon: Building2, label: 'Publisher', value: book?.publisher },
    { icon: FileText, label: 'Page', value: book?.page },
    { icon: Calendar, label: 'Year', value: book?.year },
    { icon: Bookmark, label: 'Edition', value: book?.edition },
    { icon: ShieldCheck, label: 'Subject', value: book?.subject },
    { icon: ClipboardList, label: 'Note', value: book?.note },
    { icon: List, label: 'Particular', value: book?.particular },
  ];

  return (
    <>
      {/* Book Numbers Modal */}
      <AnimatePresence>
        {showModal && isAdmin && (
          <BookNumbersModal bhandars={book?.bhandars || []} onClose={() => setShowModal(false)} />
        )}
      </AnimatePresence>

      <div className="relative w-full p-4 sm:p-6 bg-gradient-to-br from-[#E3F2FD]/80 via-white to-[#E0F7FA]/50 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-40">
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="w-full h-full absolute inset-0 text-[#00b6be]/20 fill-current">
            <path d="M0,0 C200,100 300,50 500,150 C700,250 800,200 1000,100 L1000,0 L0,0 Z" />
            <path d="M0,300 C250,200 350,250 600,150 C850,50 950,100 1000,200 L1000,300 L0,300 Z" className="text-[#0D47A1]/5" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row gap-5 lg:gap-8">

          {/* Left — Image Slider: hidden on mobile to save space */}
          <div className="hidden lg:flex w-full lg:w-[240px] shrink-0 items-center justify-center gap-2 lg:gap-0">
            <button className="w-8 h-8 rounded-full bg-[#1E88E5] text-white flex items-center justify-center shadow-lg hover:bg-[#1565C0] transition-colors lg:-mr-4 z-20 shrink-0">
              <ChevronLeft size={18} strokeWidth={2.5} />
            </button>
            <div className="relative w-[180px] h-[240px] lg:w-[200px] lg:h-[280px] bg-white rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.08)] border-4 border-white flex flex-col items-center justify-center p-4 text-center z-10">
              <div className="w-16 h-16 lg:w-24 lg:h-24 mb-3 lg:mb-4 opacity-40">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full text-[#1E88E5]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-[12px] lg:text-[13px] font-extrabold text-[#0A2540]/60">Image Not Available</span>
            </div>
            <button className="w-8 h-8 rounded-full bg-[#1E88E5] text-white flex items-center justify-center shadow-lg hover:bg-[#1565C0] transition-colors lg:-ml-4 z-20 shrink-0">
              <ChevronRight size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Right — Details + Table */}
          <div className="flex-1 flex flex-col min-w-0">

            {/* Section Title */}
            <div className="mb-3.5">
              <h3 className="text-[18px] sm:text-[20px] font-extrabold text-[#0D47A1] font-heading flex items-center gap-2">
                Book Details
              </h3>
              <div className="w-12 h-1 bg-gradient-to-r from-[#FF6B00] to-[#FFA726] rounded-full mt-1.5" />
            </div>

            {/* Mobile: single-column list, no cards, text wraps naturally */}
            <div className="block sm:hidden bg-white/70 backdrop-blur-md rounded-2xl px-3 py-1 mb-5 border border-white/60 shadow-sm">
              {details.map((detail, idx) => (
                <MobileRow key={idx} icon={detail.icon} label={detail.label} value={detail.value} />
              ))}
            </div>

            {/* Desktop: card grid */}
            <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 mb-6">
              {details.map((detail, idx) => (
                <DetailCard key={idx} icon={detail.icon} label={detail.label} value={detail.value} />
              ))}
              <div className="flex items-center justify-center p-3">
                <button className="w-9 h-9 rounded-full bg-[#00b6be] text-white flex items-center justify-center shadow-lg hover:bg-[#009ca3] transition-transform hover:scale-105">
                  <ArrowRight size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Available In Bhandar */}
            <div>
              <div className="mb-3.5 flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] sm:text-[20px] font-extrabold text-[#0D47A1] font-heading">
                    Available In Bhandar
                  </h3>
                  <div className="w-12 h-1 bg-gradient-to-r from-[#FF6B00] to-[#FFA726] rounded-full mt-1.5" />
                </div>

                {/* Admin-only Issue button */}
                {isAdmin && book?.bhandars?.length > 0 && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] text-white text-[13px] font-bold rounded-xl shadow-md hover:opacity-90 hover:shadow-lg transition-all cursor-pointer"
                  >
                    <BookCheck size={15} /> Issue / Return
                  </button>
                )}
              </div>

              {/* Bhandar Desktop Table */}
              <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#1D4ED8] to-[#00b6be]">
                        <th className="px-4 py-3 text-[12.5px] font-bold text-white tracking-wide border-r border-white/20 w-[15%]">
                          <div className="flex items-center gap-1.5"><BookOpen size={13} /> Book Number</div>
                        </th>
                        <th className="px-4 py-3 text-[12.5px] font-bold text-white tracking-wide border-r border-white/20 w-[45%]">
                          <div className="flex items-center gap-1.5"><Building2 size={13} /> Bhandar Name</div>
                        </th>
                        <th className="px-4 py-3 text-[12.5px] font-bold text-white tracking-wide border-r border-white/20 w-[20%]">
                          <div className="flex items-center gap-1.5"><Globe size={13} /> City</div>
                        </th>
                        <th className="px-4 py-3 text-[12.5px] font-bold text-white tracking-wide w-[20%]">
                          <div className="flex items-center gap-1.5"><User size={13} /> Contact</div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(book?.bhandars || []).map((bhandar, idx) => (
                        <tr key={idx} className="border-b border-neutral-100 hover:bg-[#F8FAFC] transition-colors bg-white">
                          <td className="px-4 py-3 text-[13px] font-bold text-neutral-800">{bhandar.bookNumber}</td>
                          <td className="px-4 py-3 text-[13px] font-semibold text-neutral-700">{bhandar.name}</td>
                          <td className="px-4 py-3 text-[13px] font-medium text-neutral-600">{bhandar.city}</td>
                          <td className="px-4 py-3 text-[13px] font-semibold text-[#1E88E5] flex items-center gap-1.5">
                            <span className="w-5.5 h-5.5 rounded-full bg-[#1E88E5]/10 flex items-center justify-center shrink-0">📞</span>
                            {bhandar.contact}
                          </td>
                        </tr>
                      ))}
                      {(!book?.bhandars || book.bhandars.length === 0) && (
                        <tr>
                          <td colSpan="4" className="px-4 py-6 text-center text-neutral-500 font-medium">
                            No bhandar details available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bhandar Mobile List */}
              <div className="block sm:hidden space-y-2.5">
                {(book?.bhandars || []).map((bhandar, idx) => (
                  <div key={idx} className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-neutral-200/50 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                      <span className="text-[12.5px] font-extrabold text-[#0D47A1] flex items-center gap-1.5">
                        <BookOpen size={13} className="text-[#0D47A1] shrink-0" /> No. {bhandar.bookNumber}
                      </span>
                      <span className="text-[11px] font-bold text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-0.5 rounded-md">{bhandar.city}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[13.5px] font-extrabold text-[#0A2540] leading-snug">{bhandar.name}</span>
                      <a href={`tel:${bhandar.contact}`} className="text-[12.5px] font-bold text-[#1E88E5] flex items-center gap-1.5 mt-1 hover:underline">
                        <span className="w-5 h-5 rounded-full bg-[#1E88E5]/10 flex items-center justify-center shrink-0">📞</span>
                        {bhandar.contact}
                      </a>
                    </div>
                  </div>
                ))}
                {(!book?.bhandars || book.bhandars.length === 0) && (
                  <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-neutral-200/50 text-center text-neutral-500 font-semibold text-[13px]">
                    No bhandar details available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
