import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ChevronLeft, ChevronRight, MoreHorizontal, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import ExpandedBookDetails from './ExpandedBookDetails';
import { decryptAES128 } from '../utils/crypto';
import { transliterateIndicToEnglish, hasIndicCharacters } from '../utils/transliteration';
import { useAuth } from '../context/AuthContext';

/** Highlight matching substrings in yellow */
function Highlight({ text, query }) {
  if (!query || !text) return <span>{text || '-'}</span>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = String(text).split(new RegExp(`(${escaped})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5 font-bold not-italic">{part}</mark>
          : part
      )}
    </span>
  );
}

const mapLanguageInitialToFull = (initial) => {
  if (!initial) return '-';
  const val = initial.trim();
  const results = [];
  if (/[Ggગુ]/u.test(val)) results.push('Gujarati');
  if (/[HhહિહDd]/u.test(val)) results.push('Hindi');
  if (/[Ssસં]/u.test(val)) results.push('Sanskrit');
  if (/[Ppપ્રા]/u.test(val)) results.push('Prakrit');
  if (/[Eeઅંઇ]/u.test(val) || val.toLowerCase().includes('english')) results.push('English');
  if (results.length > 0) return results.join(', ');
  return initial;
};

export default function BookTable({ books, activeLang = 'Gujarati', searchQuery = '' }) {
  const { isLoggedIn } = useAuth();
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [detailsCache, setDetailsCache] = useState({});
  const [loadingIds, setLoadingIds] = useState({});
  const [enrichedBooks, setEnrichedBooks] = useState({});

  // Refs for scroll-to-expanded on mobile
  const rowRefs = useRef({});

  // Pick the right display name based on active language
  const displayName = (book) => {
    if (activeLang === 'Hindi' && book.name_hindi) return book.name_hindi;
    return book.name || '-';
  };

  // Sort state — default ascending by name
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  // Reset page when books change
  React.useEffect(() => {
    setCurrentPage(1);
    setExpandedRowId(null); // close expanded when results change
  }, [books]);

  // Sort + Pagination Logic
  const sortedBooks = [...books].sort((a, b) => {
    const av = (a[sortField] || '').toString().toLowerCase();
    const bv = (b[sortField] || '').toString().toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });
  const totalItems = sortedBooks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = sortedBooks.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setExpandedRowId(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPaginationGroup = () => {
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(start + 4, totalPages);
    if (end - start < 4) start = Math.max(end - 4, 1);
    const group = [];
    if (start > 1) { group.push(1); if (start > 2) group.push('...'); }
    for (let i = start; i <= end; i++) group.push(i);
    if (end < totalPages) { if (end < totalPages - 1) group.push('...'); group.push(totalPages); }
    return group;
  };

  const toggleRow = async (id, masterSsid) => {
    const isCurrentlyExpanded = expandedRowId === id;
    const nextId = isCurrentlyExpanded ? null : id;
    setExpandedRowId(nextId);

    // Scroll the tapped row into view smoothly after animation starts (mobile fix)
    if (!isCurrentlyExpanded) {
      setTimeout(() => {
        const el = rowRefs.current[id];
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 80); // slight delay so expand animation has begun
    }

    // If expanding and not in cache, fetch rich details
    if (!isCurrentlyExpanded && !detailsCache[id]) {
      setLoadingIds(prev => ({ ...prev, [id]: true }));
      try {
        const bookObj = books.find(b => b.id === id);
        const bookLang = bookObj?.language;
        const isHindiContext = bookLang === 'H' || bookLang === 'S' || bookLang === 'P' || bookLang === 'Hindi' || bookLang === 'Sanskrit' || bookLang === 'Prakrit';
        const endpoint = isHindiContext ? '/front/quick_hindi_book_details' : '/front/get_book_details';
        const response = await fetch(`${endpoint}?master_ssid=${masterSsid}`);
        const result = await response.json();

        if (result && result.data) {
          const detail = result.data;

          const decryptedBookNum = await decryptAES128(detail.book_number);
          const decryptedSname = await decryptAES128(detail.sname);

          const codes = detail.bhandar_code ? detail.bhandar_code.split(',') : [];
          const bookNums = decryptedBookNum ? decryptedBookNum.split(',') : [];
          const names = decryptedSname ? decryptedSname.split('|') : [];
          const cities = detail.city ? detail.city.split('|') : [];
          const mobiles = detail.mobile ? detail.mobile.split(',') : [];

          const bhandars = codes.map((code, idx) => ({
            bookNumber: bookNums[idx] || '-',
            name: names[idx] || '-',
            city: cities[idx] || '-',
            contact: mobiles[idx] || '-'
          }));

          const mappedDetails = {
            id: detail.master_ssid,
            name: detail.book_name,
            part: detail.part,
            alternateName: detail.alternate_name,
            kruti: detail.Kruti,
            author: detail.author,
            editor: detail.editor,
            languageFull: detail.lang_name,
            publisher: detail.publisher,
            page: detail.page,
            year: detail.year,
            edition: detail.edition,
            subject: detail.subject,
            note: detail.book_note,
            particular: detail.perticular,
            bhandars: bhandars
          };

          setDetailsCache(prev => ({ ...prev, [id]: mappedDetails }));
          setEnrichedBooks(prev => ({
            ...prev,
            [id]: {
              author:    mappedDetails.author    || '',
              editor:    mappedDetails.editor    || '',
              publisher: mappedDetails.publisher || '',
              language:  mappedDetails.languageFull || '',
            }
          }));

          // Re-scroll once data loads (content height changed)
          setTimeout(() => {
            const el = rowRefs.current[id];
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 150);
        }
      } catch (err) {
        console.error("Failed to fetch book details:", err);
      } finally {
        setLoadingIds(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  return (
    <div className="w-full flex flex-col bg-white rounded-[24px] shadow-[0_16px_40px_rgba(10,37,64,0.08)] border border-neutral-100 overflow-hidden">

      {/* ── DESKTOP TABLE (md+) ── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gradient-to-r from-[#1D4ED8] to-[#00b6be] text-white">
              <th className="px-5 py-3 text-[13px] font-bold whitespace-nowrap w-[80px]">Expand</th>
              {[['name','Name'],['part','Part'],['author','Author'],['editor','Editor']].map(([f,label])=>(
                <th key={f} onClick={()=>handleSort(f)} className="px-5 py-3 text-[13px] font-bold whitespace-nowrap cursor-pointer select-none hover:bg-white/10 transition-colors">
                  <span className="flex items-center gap-1">{label}{sortField===f?(sortDir==='asc'?<ArrowUp size={12}/>:<ArrowDown size={12}/>):<ArrowUp size={12} className="opacity-30"/>}</span>
                </th>
              ))}
              <th className="px-5 py-3 text-[13px] font-bold whitespace-nowrap w-[100px] text-center">Language</th>
              <th onClick={()=>handleSort('publisher')} className="px-5 py-3 text-[13px] font-bold whitespace-nowrap cursor-pointer select-none hover:bg-white/10 transition-colors">
                <span className="flex items-center gap-1">Publisher{sortField==='publisher'?(sortDir==='asc'?<ArrowUp size={12}/>:<ArrowDown size={12}/>):<ArrowUp size={12} className="opacity-30"/>}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentBooks.map((book) => {
              const isExpanded = expandedRowId === book.id;
              const isLoading = loadingIds[book.id];
              const details = detailsCache[book.id];

              return (
                <React.Fragment key={book.id}>
                  <tr className={`border-b border-neutral-100 transition-colors ${isExpanded ? 'bg-[#F8FAFC]' : 'hover:bg-neutral-50 bg-white'}`}>
                    <td className="px-5 py-4 align-middle">
                      <button
                        onClick={() => toggleRow(book.id, book.master_ssid || book.id)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm ${
                          isExpanded
                            ? 'bg-[#1565FF] text-white'
                            : 'bg-[#00b6be] text-white hover:bg-[#009ca3]'
                        }`}
                      >
                        {isExpanded ? <Minus size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      {isExpanded ? (
                        <div className="flex flex-col justify-center">
                          <div className="flex items-center">
                            <div className="w-1 h-6 bg-[#1565FF] rounded-r-md -ml-5 mr-4 shrink-0"></div>
                            <span className="text-[14px] font-bold text-[#0A2540]">
                              <Highlight text={displayName(book)} query={searchQuery} />
                            </span>
                          </div>
                          {hasIndicCharacters(displayName(book)) && (
                            <div className="text-[12px] font-semibold text-neutral-400 mt-1 pl-4 italic tracking-wide">
                              ({transliterateIndicToEnglish(displayName(book))})
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col justify-center">
                          <span className="text-[14px] font-bold text-[#0A2540]">
                            <Highlight text={displayName(book)} query={searchQuery} />
                          </span>
                          {hasIndicCharacters(displayName(book)) && (
                            <div className="text-[12px] font-semibold text-neutral-400 mt-0.5 italic tracking-wide">
                              ({transliterateIndicToEnglish(displayName(book))})
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[14px] font-medium text-neutral-600">{book.part || '-'}</td>
                    <td className="px-5 py-4 text-[14px] font-medium text-neutral-600">
                      <Highlight text={enrichedBooks[book.id]?.author || book.author || ''} query={searchQuery} />
                      {!(enrichedBooks[book.id]?.author || book.author) && <span className="text-neutral-300 italic text-[12px]">—</span>}
                    </td>
                    <td className="px-5 py-4 text-[14px] font-medium text-neutral-600">
                      <Highlight text={enrichedBooks[book.id]?.editor || book.editor || ''} query={searchQuery} />
                      {!(enrichedBooks[book.id]?.editor || book.editor) && <span className="text-neutral-300 italic text-[12px]">—</span>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {book.language ? (
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-[#00b6be]/15 text-[#0F766E] font-bold text-[11px]">
                          {mapLanguageInitialToFull(book.language)}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-5 py-4 text-[14px] font-medium text-neutral-600">
                      <Highlight text={enrichedBooks[book.id]?.publisher || book.publisher || ''} query={searchQuery} />
                      {!(enrichedBooks[book.id]?.publisher || book.publisher) && <span className="text-neutral-300 italic text-[12px]">—</span>}
                    </td>
                  </tr>

                  {/* Desktop Expanded Row */}
                  <AnimatePresence>
                    {isExpanded && (
                      <tr className="bg-[#F8FAFC]">
                        <td colSpan={7} className="p-0 border-b-2 border-[#1565FF]/20 overflow-hidden">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                          >
                            {isLoading ? (
                              <div className="flex flex-col items-center justify-center py-10 gap-3 text-neutral-500 font-semibold bg-gradient-to-br from-[#E3F2FD]/20 to-[#E0F7FA]/10">
                                <Loader2 size={32} className="text-[#1565FF] animate-spin" />
                                <span className="text-[13px] tracking-wide animate-pulse">Decrypting and loading available inventory details...</span>
                              </div>
                            ) : details ? (
                              <ExpandedBookDetails book={details} isAdmin={isLoggedIn} />
                            ) : (
                              <div className="py-6 text-center text-neutral-400 font-medium">Failed to load details.</div>
                            )}
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARD LIST (< md) ── */}
      <div className="block md:hidden divide-y divide-neutral-100">
        {currentBooks.map((book) => {
          const isExpanded = expandedRowId === book.id;
          const isLoading = loadingIds[book.id];
          const details = detailsCache[book.id];

          return (
            <div
              key={book.id}
              ref={el => { rowRefs.current[book.id] = el; }}
              className={`transition-colors duration-200 ${isExpanded ? 'bg-[#F0F7FF]' : 'bg-white'}`}
            >
              {/* Card Header — always visible */}
              <div
                className="flex items-start gap-3 px-4 py-3.5 cursor-pointer active:bg-neutral-50"
                onClick={() => toggleRow(book.id, book.master_ssid || book.id)}
              >
                {/* Language + Part badges */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    {book.language && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#00b6be]/15 text-[#0F766E] font-bold text-[10px] uppercase tracking-wider">
                        {mapLanguageInitialToFull(book.language)}
                      </span>
                    )}
                    {book.part && (
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Pt. {book.part}</span>
                    )}
                  </div>

                  {/* Book Name — full wrap, no truncation */}
                  <p className="text-[14px] font-extrabold text-[#0A2540] leading-snug break-words">
                    <Highlight text={displayName(book)} query={searchQuery} />
                  </p>
                  {hasIndicCharacters(displayName(book)) && (
                    <p className="text-[11px] font-semibold text-neutral-400 mt-0.5 italic break-words">
                      ({transliterateIndicToEnglish(displayName(book))})
                    </p>
                  )}

                  {/* Author + Publisher inline — compact */}
                  <div className="flex flex-wrap gap-x-3 mt-1.5">
                    {(enrichedBooks[book.id]?.author || book.author) && (
                      <p className="text-[11.5px] text-neutral-500 font-medium">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mr-1">Author</span>
                        <Highlight text={enrichedBooks[book.id]?.author || book.author} query={searchQuery} />
                      </p>
                    )}
                    {(enrichedBooks[book.id]?.publisher || book.publisher) && (
                      <p className="text-[11.5px] text-neutral-500 font-medium">
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mr-1">Pub.</span>
                        <Highlight text={enrichedBooks[book.id]?.publisher || book.publisher} query={searchQuery} />
                      </p>
                    )}
                  </div>
                </div>

                {/* Expand/Collapse button */}
                <button
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all shadow-sm ${
                    isExpanded
                      ? 'bg-[#1565FF] text-white'
                      : 'bg-[#00b6be] text-white hover:bg-[#009ca3]'
                  }`}
                  onClick={e => { e.stopPropagation(); toggleRow(book.id, book.master_ssid || book.id); }}
                >
                  {isExpanded ? <Minus size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
                </button>
              </div>

              {/* Mobile Expanded Panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                    className="overflow-hidden border-t border-[#1565FF]/10"
                  >
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-8 gap-2 text-neutral-400">
                        <Loader2 size={26} className="text-[#1565FF] animate-spin" />
                        <span className="text-[12px] font-semibold animate-pulse">Loading details…</span>
                      </div>
                    ) : details ? (
                      <ExpandedBookDetails book={details} isAdmin={isLoggedIn} />
                    ) : (
                      <div className="py-4 text-center text-neutral-400 text-[13px] font-medium">Failed to load details.</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 0 && (
        <div className="bg-[#F8FAFC] border-t border-neutral-100 px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[12px] sm:text-[13px] font-bold text-[#0D47A1]">
            Showing {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, totalItems)} of {totalItems}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center transition-colors bg-transparent shrink-0 ${currentPage === 1 ? 'text-neutral-300 cursor-not-allowed' : 'text-neutral-500 hover:bg-white hover:text-[#1565FF] hover:border-[#1565FF]/30 cursor-pointer'}`}
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>

            {getPaginationGroup().map((item, index) => {
              if (item === '...') return (
                <div key={`dots-${index}`} className="w-8 h-8 flex items-center justify-center text-neutral-400 shrink-0">
                  <MoreHorizontal size={16} />
                </div>
              );
              const isActive = currentPage === item;
              return (
                <button
                  key={item}
                  onClick={() => handlePageChange(item)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold shrink-0 transition-colors cursor-pointer
                    ${isActive
                      ? 'bg-[#1565FF] text-white shadow-md border-transparent'
                      : 'border border-neutral-200 text-neutral-600 hover:bg-white hover:text-[#1565FF] hover:border-[#1565FF]/30 bg-transparent'
                    }`}
                >
                  {item}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center transition-colors bg-transparent shrink-0 ${currentPage === totalPages ? 'text-neutral-300 cursor-not-allowed' : 'text-neutral-500 hover:bg-white hover:text-[#1565FF] hover:border-[#1565FF]/30 cursor-pointer'}`}
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
