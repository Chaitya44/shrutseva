import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Library, Search } from 'lucide-react';
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

export default function BooksView() {
  const { selectedBhandar } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const bhandar = sanitize(selectedBhandar);
      const title = sanitize(debouncedQuery);
      const res = await fetch(
        `/front/quick_advance_book_search?title=${encodeURIComponent(title)}&city=all&client_side=true&bhandar=${encodeURIComponent(bhandar)}`
      );
      const json = await res.json();
      if (json && json.data) setData(json.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }, [selectedBhandar, debouncedQuery]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="w-full max-w-[1400px] px-4 sm:px-6 mx-auto pb-8 pt-14 sm:pt-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-heading font-extrabold tracking-tight">
            <span className="text-[#012c77]">Books</span><span className="text-[#FF6B00]"> Catalog</span>
          </h1>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">Full library catalog browser</span>
        </div>
        <BhandarPageSelector />
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by book title..."
          className="w-full max-w-md border border-neutral-200 focus:border-[#012c77] rounded-xl pl-10 pr-4 py-3 text-[14px] outline-none bg-white/80 backdrop-blur transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-[#012c77] border-t-transparent rounded-full animate-spin" /></div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
          <Library size={40} className="mb-3 opacity-30" />
          <p className="font-semibold">No books found</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="overflow-hidden rounded-2xl border border-white/60 shadow-sm bg-white/80 backdrop-blur-xl"
        >
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gradient-to-r from-[#012c77] to-[#1D4ED8] text-white">
                <th className="px-5 py-3 font-bold text-left">Book Name</th>
                <th className="px-5 py-3 font-bold text-left">Author</th>
                <th className="px-5 py-3 font-bold text-left">Language</th>
                <th className="px-5 py-3 font-bold text-left">Publisher</th>
                <th className="px-5 py-3 font-bold text-left">Part</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className={`border-b border-neutral-50 hover:bg-blue-50/50 transition-colors ${i%2===0?'bg-white':'bg-neutral-50/40'}`}>
                  <td className="px-5 py-3.5 font-semibold text-neutral-700">{row.book_name||'-'}</td>
                  <td className="px-5 py-3.5 text-neutral-500">{row.author||'-'}</td>
                  <td className="px-5 py-3.5 text-neutral-500">{row.lang_name||'-'}</td>
                  <td className="px-5 py-3.5 text-neutral-500">{row.publisher||'-'}</td>
                  <td className="px-5 py-3.5 text-neutral-500">{row.part||'-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
