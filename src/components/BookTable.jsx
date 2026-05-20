import React, { useState, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ChevronLeft, ChevronRight, MoreHorizontal, Loader2, ArrowUp, ArrowDown, ChevronRight as NavNext, ChevronLeft as NavPrev } from 'lucide-react';
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

// Parse part as number for sort (handles "1", "2", "Part 1", etc.)
const parsePart = (p) => {
  if (!p) return 0;
  const n = parseInt(String(p).replace(/\D/g, ''), 10);
  return isNaN(n) ? 0 : n;
};

export default function BookTable({ books, activeLang = 'Gujarati', searchQuery = '' }) {
  const { isLoggedIn } = useAuth();
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [detailsCache, setDetailsCache] = useState({});
  const [loadingIds, setLoadingIds] = useState({});
  const [enrichedBooks, setEnrichedBooks] = useState({});

  // Scroll-anchor fix: save scroll Y before state update, restore after layout
  const savedScrollRef = useRef(null);

  // Pick the right display name based on active language
  const displayName = (book) => {
    if (activeLang === 'Hindi' && book.name_hindi) return book.name_hindi;
    return book.name || '-';
  };

  // Sort: primary by name asc, secondary by part numeric asc
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);

  React.useEffect(() => {
    setCurrentPage(1);
    setExpandedRowId(null);
  }, [books]);

  // Sort: name asc + part numeric asc as secondary (always)
  const sortedBooks = [...books].sort((a, b) => {
    let av, bv;
    if (sortField === 'name') {
      av = (a.name || '').toLowerCase();
      bv = (b.name || '').toLowerCase();
      if (av === bv) {
        // secondary: part numeric ascending
        return parsePart(a.part) - parsePart(b.part);
      }
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    av = (a[sortField] || '').toString().toLowerCase();
    bv = (b[sortField] || '').toString().toLowerCase();
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalItems = sortedBooks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBooks = sortedBooks.slice(indexOfFirstItem, indexOfLastItem);

  // Global index of expanded book (across currentBooks)
  const expandedIdx = currentBooks.findIndex(b => b.id === expandedRowId);

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

  // Restore scroll position after render to prevent jump
  useLayoutEffect(() => {
    if (savedScrollRef.current !== null) {
      window.scrollTo(0, savedScrollRef.current);
      savedScrollRef.current = null;
    }
  });

  const toggleRow = async (id, masterSsid) => {
    const isCurrentlyExpanded = expandedRowId === id;
    // Save scroll BEFORE state change
    savedScrollRef.current = window.scrollY;
    setExpandedRowId(isCurrentlyExpanded ? null : id);

    if (!isCurrentlyExpanded && !detailsCache[id]) {
      setLoadingIds(prev => ({ ...prev, [id]: true }));
      try {
        const bookObj = books.find(b => b.id === id);
        const bookLang = bookObj?.language;
        const isHindiContext = ['H','S','P','Hindi','Sanskrit','Prakrit'].includes(bookLang);
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
              author: mappedDetails.author || '',
              editor: mappedDetails.editor || '',
              publisher: mappedDetails.publisher || '',
              language: mappedDetails.languageFull || '',
            }
          }));
        }
      } catch (err) {
        console.error('Failed to fetch book details:', err);
      } finally {
        setLoadingIds(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  // Navigate prev/next expanded result
  const navigateExpanded = (direction) => {
    const nextIdx = expandedIdx + direction;
    if (nextIdx < 0 || nextIdx >= currentBooks.length) return;
    const nextBook = currentBooks[nextIdx];
    // Save scroll before nav
    savedScrollRef.current = window.scrollY;
    setExpandedRowId(nextBook.id);
    if (!detailsCache[nextBook.id]) {
      toggleRow(nextBook.id, nextBook.master_ssid || nextBook.id);
    }
  };

  // Nav bar shown at top of expanded panel
  const ExpandedNav = ({ bookId }) => {
    const idx = currentBooks.findIndex(b => b.id === bookId);
    const hasPrev = idx > 0;
    const hasNext = idx < currentBooks.length - 1;
    return (
      <div className="flex items-center justify-between px-4 py-2 bg-[#012c77] text-white text-[12px] font-bold select-none">
        <button
          onClick={(e) => { e.stopPropagation(); savedScrollRef.current = window.scrollY; navigateExpanded(-1); }}
          disabled={!hasPrev}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${hasPrev ? 'hover:bg-white/10 cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}
        >
          <ChevronLeft size={14} strokeWidth={2.5} /> Prev
        </button>
        <span className="text-[11px] text-white/70 font-medium">{idx + 1} / {currentBooks.length}</span>
        <button
          onClick={(e) => { e.stopPropagation(); savedScrollRef.current = window.scrollY; navigateExpanded(1); }}
          disabled={!hasNext}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ${hasNext ? 'hover:bg-white/10 cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}
        >
          Next <ChevronRight size={14} strokeWidth={2.5} />
        </button>
      </div>
    );
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
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm ${isExpanded ? 'bg-[#1565FF] text-white' : 'bg-[#00b6be] text-white hover:bg-[#009ca3]'}`}
                      >
                        {isExpanded ? <Minus size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col justify-center">
                        {isExpanded && <div className="w-1 h-full bg-[#1565FF] rounded-r-md absolute left-0" />}
                        <span className="text-[14px] font-bold text-[#0A2540]"><Highlight text={displayName(book)} query={searchQuery} /></span>
                        {hasIndicCharacters(displayName(book)) && (
                          <div className="text-[12px] font-semibold text-neutral-400 mt-0.5 italic">({transliterateIndicToEnglish(displayName(book))})</div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[14px] font-medium text-neutral-600">{book.part || '-'}</td>
                    <td className="px-5 py-4 text-[14px] font-medium text-neutral-600">
                      {enrichedBooks[book.id]?.author || book.author
                        ? <Highlight text={enrichedBooks[book.id]?.author || book.author} query={searchQuery} />
                        : <span className="text-neutral-300 italic text-[12px]">—</span>}
                    </td>
                    <td className="px-5 py-4 text-[14px] font-medium text-neutral-600">
                      {enrichedBooks[book.id]?.editor || book.editor
                        ? <Highlight text={enrichedBooks[book.id]?.editor || book.editor} query={searchQuery} />
                        : <span className="text-neutral-300 italic text-[12px]">—</span>}
                    </td>
                    <td className="px-5 py-4 text-center">
                      {book.language
                        ? <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-[#00b6be]/15 text-[#0F766E] font-bold text-[11px]">{mapLanguageInitialToFull(book.language)}</span>
                        : '-'}
                    </td>
                    <td className="px-5 py-4 text-[14px] font-medium text-neutral-600">
                      {enrichedBooks[book.id]?.publisher || book.publisher
                        ? <Highlight text={enrichedBooks[book.id]?.publisher || book.publisher} query={searchQuery} />
                        : <span className="text-neutral-300 italic text-[12px]">—</span>}
                    </td>
                  </tr>
                  <AnimatePresence>
                    {isExpanded && (
                      <tr className="bg-[#F8FAFC]">
                        <td colSpan={7} className="p-0 border-b-2 border-[#1565FF]/20 overflow-hidden">
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                          >
                            <ExpandedNav bookId={book.id} />
                            {isLoading ? (
                              <div className="flex flex-col items-center justify-center py-10 gap-3 text-neutral-500">
                                <Loader2 size={32} className="text-[#1565FF] animate-spin" />
                                <span className="text-[13px] animate-pulse">Loading details…</span>
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
      {/* overflow-anchor:none prevents browser scroll anchoring jumps */}
      <div className="block md:hidden divide-y divide-neutral-100" style={{ overflowAnchor: 'none' }}>
        {currentBooks.map((book) => {
          const isExpanded = expandedRowId === book.id;
          const isLoading = loadingIds[book.id];
          const details = detailsCache[book.id];

          return (
            <div key={book.id} className={`transition-colors duration-150 ${isExpanded ? 'bg-[#F0F7FF]' : 'bg-white'}`}>

              {/* Card Header */}
              <div
                className="flex items-start gap-2.5 px-3.5 py-3 cursor-pointer active:bg-neutral-50"
                onClick={() => toggleRow(book.id, book.master_ssid || book.id)}
              >
                <div className="flex-1 min-w-0">
                  {/* Badges row */}
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    {book.language && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-[#00b6be]/15 text-[#0F766E] font-bold text-[9px] uppercase tracking-wider">
                        {mapLanguageInitialToFull(book.language)}
                      </span>
                    )}
                    {book.part && (
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider bg-neutral-100 px-1.5 py-0.5 rounded">
                        Pt.{book.part}
                      </span>
                    )}
                  </div>

                  {/* Name — full wrap */}
                  <p className="text-[13.5px] font-extrabold text-[#0A2540] leading-snug break-words">
                    <Highlight text={displayName(book)} query={searchQuery} />
                  </p>
                  {hasIndicCharacters(displayName(book)) && (
                    <p className="text-[10.5px] font-medium text-neutral-400 mt-0.5 italic break-words">
                      ({transliterateIndicToEnglish(displayName(book))})
                    </p>
                  )}

                  {/* Author + Publisher compact */}
                  <div className="flex flex-wrap gap-x-2.5 mt-1">
                    {(enrichedBooks[book.id]?.author || book.author) && (
                      <p className="text-[11px] text-neutral-500">
                        <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-wider mr-0.5">By</span>
                        <Highlight text={enrichedBooks[book.id]?.author || book.author} query={searchQuery} />
                      </p>
                    )}
                    {(enrichedBooks[book.id]?.publisher || book.publisher) && (
                      <p className="text-[11px] text-neutral-400">
                        <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-wider mr-0.5">Pub.</span>
                        <Highlight text={enrichedBooks[book.id]?.publisher || book.publisher} query={searchQuery} />
                      </p>
                    )}
                  </div>
                </div>

                {/* Expand button — compact */}
                <button
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 transition-all ${isExpanded ? 'bg-[#1565FF] text-white' : 'bg-[#00b6be] text-white'}`}
                  onClick={e => { e.stopPropagation(); toggleRow(book.id, book.master_ssid || book.id); }}
                >
                  {isExpanded ? <Minus size={13} strokeWidth={3} /> : <Plus size={13} strokeWidth={3} />}
                </button>
              </div>

              {/* Mobile Expanded Panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    className="overflow-hidden border-t border-[#1565FF]/10"
                    style={{ overflowAnchor: 'none' }}
                  >
                    <ExpandedNav bookId={book.id} />
                    {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-6 gap-2 text-neutral-400">
                        <Loader2 size={24} className="text-[#1565FF] animate-spin" />
                        <span className="text-[11px] font-semibold animate-pulse">Loading…</span>
                      </div>
                    ) : details ? (
                      <ExpandedBookDetails book={details} isAdmin={isLoggedIn} />
                    ) : (
                      <div className="py-4 text-center text-neutral-400 text-[12px]">Failed to load details.</div>
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
        <div className="bg-[#F8FAFC] border-t border-neutral-100 px-3 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[11px] sm:text-[13px] font-bold text-[#0D47A1]">
            {indexOfFirstItem + 1}–{Math.min(indexOfLastItem, totalItems)} of {totalItems}
          </div>
          <div className="flex items-center gap-1 overflow-x-auto max-w-full">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-neutral-200 flex items-center justify-center shrink-0 ${currentPage === 1 ? 'text-neutral-300 cursor-not-allowed' : 'text-neutral-500 hover:bg-white hover:text-[#1565FF] cursor-pointer'}`}
            >
              <ChevronLeft size={14} strokeWidth={2.5} />
            </button>
            {getPaginationGroup().map((item, index) => {
              if (item === '...') return (
                <div key={`dots-${index}`} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-neutral-400 shrink-0">
                  <MoreHorizontal size={13} />
                </div>
              );
              const isActive = currentPage === item;
              return (
                <button
                  key={item}
                  onClick={() => handlePageChange(item)}
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[11px] sm:text-[13px] font-bold shrink-0 cursor-pointer
                    ${isActive ? 'bg-[#1565FF] text-white shadow-sm' : 'border border-neutral-200 text-neutral-600 hover:bg-white hover:text-[#1565FF]'}`}
                >
                  {item}
                </button>
              );
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-neutral-200 flex items-center justify-center shrink-0 ${currentPage === totalPages ? 'text-neutral-300 cursor-not-allowed' : 'text-neutral-500 hover:bg-white hover:text-[#1565FF] cursor-pointer'}`}
            >
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
