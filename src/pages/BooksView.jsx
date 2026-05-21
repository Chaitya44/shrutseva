import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, Search, ChevronLeft, ChevronRight, BookOpen, User, Languages, Building2, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BhandarPageSelector from '../components/BhandarPageSelector';

function sanitize(str) { return String(str || '').replace(/<[^>]*>/g, '').trim(); }

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const PAGE_SIZE = 50;

export default function BooksView() {
  const { selectedBhandar } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const debouncedQuery = useDebounce(query, 400);
  const tableRef = useRef(null);

  // Reset to page 1 when search or bhandar changes
  useEffect(() => { setPage(1); }, [debouncedQuery, selectedBhandar]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const bhandar = sanitize(selectedBhandar);
      const title = sanitize(debouncedQuery);
      const start = (page - 1) * PAGE_SIZE;

      // Use server-side pagination: NO client_side=true, pass length+start
      const params = new URLSearchParams({
        title,
        city: 'my_bhandar',
        bhandar_code: bhandar,
        length: PAGE_SIZE,
        start,
        draw: page,
      });

      const res = await fetch(`/front/quick_advance_book_search?${params.toString()}`);
      const json = await res.json();
      if (json && json.data) {
        setData(json.data);
        setTotalRecords(json.recordsTotal || json.recordsFiltered || 0);
      }
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [selectedBhandar, debouncedQuery, page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.ceil(totalRecords / PAGE_SIZE);

  const goToPage = (p) => {
    const clamped = Math.max(1, Math.min(p, totalPages));
    setPage(clamped);
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Visible page numbers (window of 5)
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      range.push(i);
    }
    return range;
  };

  return (
    <div className="w-full max-w-[1400px] px-4 sm:px-6 mx-auto pb-8 pt-14 sm:pt-16">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-heading font-extrabold tracking-tight">
            <span className="text-[#012c77]">Books</span><span className="text-[#FF6B00]"> Catalog</span>
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">Full library catalog browser</span>
            {totalRecords > 0 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#012c77]/10 text-[#012c77] text-[11px] font-extrabold">
                <BookOpen size={11} />
                {totalRecords.toLocaleString()} books
              </span>
            )}
          </div>
        </div>
        <BhandarPageSelector />
      </div>

      {/* Search + Stats row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by book title..."
            className="w-full border border-neutral-200 focus:border-[#012c77] rounded-xl pl-10 pr-4 py-3 text-[14px] outline-none bg-white/80 backdrop-blur transition-colors"
          />
        </div>
        {totalRecords > 0 && (
          <span className="text-[12px] text-neutral-400 font-medium shrink-0">
            Showing {((page - 1) * PAGE_SIZE + 1).toLocaleString()}–{Math.min(page * PAGE_SIZE, totalRecords).toLocaleString()} of {totalRecords.toLocaleString()}
          </span>
        )}
      </div>

      {/* Table */}
      <div ref={tableRef}>
        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 gap-3">
            <div className="w-8 h-8 border-4 border-[#012c77] border-t-transparent rounded-full animate-spin" />
            <span className="text-[13px] text-neutral-400 font-medium animate-pulse">Loading books...</span>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
            <Library size={40} className="mb-3 opacity-30" />
            <p className="font-semibold">No books found</p>
            <p className="text-[12px] mt-1">Select a bhandar from the selector above</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-2xl border border-white/60 shadow-sm bg-white/80 backdrop-blur-xl"
          >
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gradient-to-r from-[#012c77] to-[#1D4ED8] text-white">
                  <th className="px-4 py-3 font-bold text-left w-8 text-neutral-200 text-[11px]">#</th>
                  <th className="px-4 py-3 font-bold text-left">
                    <span className="flex items-center gap-1.5"><BookOpen size={13} /> Book Name</span>
                  </th>
                  <th className="px-4 py-3 font-bold text-left hidden md:table-cell">
                    <span className="flex items-center gap-1.5"><User size={13} /> Author</span>
                  </th>
                  <th className="px-4 py-3 font-bold text-left hidden lg:table-cell">
                    <span className="flex items-center gap-1.5"><Languages size={13} /> Language</span>
                  </th>
                  <th className="px-4 py-3 font-bold text-left hidden lg:table-cell">
                    <span className="flex items-center gap-1.5"><Building2 size={13} /> Publisher</span>
                  </th>
                  <th className="px-4 py-3 font-bold text-center w-16">Part</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-neutral-100 hover:bg-blue-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/40'}`}
                  >
                    <td className="px-4 py-3 text-neutral-300 text-[11px] font-bold">
                      {((page - 1) * PAGE_SIZE + i + 1).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-neutral-800">{row.book_name || '-'}</td>
                    <td className="px-4 py-3 text-neutral-500 hidden md:table-cell">{row.author || '-'}</td>
                    <td className="px-4 py-3 text-neutral-500 hidden lg:table-cell">
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-[11px] font-bold">{row.lang_name || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500 hidden lg:table-cell">{row.publisher || '-'}</td>
                    <td className="px-4 py-3 text-center text-neutral-500">{row.part || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
          <span className="text-[12px] text-neutral-400 font-medium">
            Page {page} of {totalPages.toLocaleString()}
          </span>
          <div className="flex items-center gap-1">
            {/* First */}
            <button
              onClick={() => goToPage(1)}
              disabled={page === 1}
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronsLeft size={16} />
            </button>
            {/* Prev */}
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page numbers */}
            {getPageNumbers().map(n => (
              <button
                key={n}
                onClick={() => goToPage(n)}
                className={`w-9 h-9 rounded-lg text-[13px] font-bold transition-colors cursor-pointer ${
                  n === page
                    ? 'bg-[#012c77] text-white shadow-sm'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {n}
              </button>
            ))}

            {/* Next */}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
            {/* Last */}
            <button
              onClick={() => goToPage(totalPages)}
              disabled={page === totalPages}
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronsRight size={16} />
            </button>
          </div>

          {/* Jump to page */}
          <div className="flex items-center gap-2 text-[12px] text-neutral-500">
            <span>Go to</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              defaultValue={page}
              key={page}
              onKeyDown={e => { if (e.key === 'Enter') goToPage(Number(e.target.value)); }}
              className="w-16 border border-neutral-200 rounded-lg px-2 py-1 text-center text-[13px] font-bold outline-none focus:border-[#012c77]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
