import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Search, FileDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BhandarPageSelector from '../components/BhandarPageSelector';

function sanitize(str) { return String(str || '').replace(/<[^>]*>/g, '').trim(); }

function arrayToCSV(data) {
  if (!data.length) return '';
  const headers = ['Book Name', 'Author', 'Language', 'Publisher', 'Part'];
  const keys = ['book_name', 'author', 'lang_name', 'publisher', 'part'];
  const escape = v => `"${String(v || '').replace(/"/g, '""')}"`;
  const rows = data.map(row => keys.map(k => escape(row[k])).join(','));
  return [headers.map(escape).join(','), ...rows].join('\n');
}

export default function BooksExport() {
  const { selectedBhandar } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    try {
      const bhandar = sanitize(selectedBhandar);
      const title = sanitize(query);
      const res = await fetch(
        `/front/quick_advance_book_search?title=${encodeURIComponent(title)}&city=all&client_side=true&bhandar=${encodeURIComponent(bhandar)}`
      );
      const json = await res.json();
      if (json && json.data) setData(json.data);
      else setData([]);
    } catch(e) { console.error(e); setData([]); }
    finally { setLoading(false); }
  }, [selectedBhandar, query]);

  const handleExport = () => {
    if (!data.length) return;
    const csv = arrayToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `books_export_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-[1400px] px-4 sm:px-6 mx-auto pb-8 pt-14 sm:pt-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-heading font-extrabold tracking-tight">
            <span className="text-[#012c77]">Export</span><span className="text-[#FF6B00]"> Books</span>
          </h1>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">Search, filter and export catalog as CSV</span>
        </div>
        <BhandarPageSelector />
      </div>

      {/* Search + Export bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Filter by book title (leave empty for all)..."
          className="flex-1 border border-neutral-200 focus:border-[#012c77] rounded-xl px-4 py-3 text-[14px] outline-none bg-white/80 backdrop-blur transition-colors"
        />
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSearch}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#012c77] to-[#1D4ED8] text-white rounded-xl font-bold text-[14px] shadow-md cursor-pointer disabled:opacity-60"
        >
          <Search size={16} /> {loading ? 'Loading...' : 'Search'}
        </motion.button>
        {data.length > 0 && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF6B00] to-[#f97316] text-white rounded-xl font-bold text-[14px] shadow-md cursor-pointer"
          >
            <FileDown size={16} /> Export as CSV
          </motion.button>
        )}
      </div>

      {/* Stats */}
      {data.length > 0 && (
        <p className="text-[12px] text-neutral-500 mb-3 font-semibold">
          {data.length} book{data.length !== 1 ? 's' : ''} found — ready to export
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-[#012c77] border-t-transparent rounded-full animate-spin" /></div>
      ) : !searched ? (
        <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
          <Download size={40} className="mb-3 opacity-30" />
          <p className="font-semibold">Search to preview books before exporting</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
          <Download size={40} className="mb-3 opacity-30" />
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
