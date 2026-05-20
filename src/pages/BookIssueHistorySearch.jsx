import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BhandarPageSelector from '../components/BhandarPageSelector';

function sanitize(str) { return String(str || '').replace(/<[^>]*>/g, '').trim(); }

export default function BookIssueHistorySearch() {
  const { selectedBhandar } = useAuth();
  const [query, setQuery] = useState('');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/front/book_history?search=${encodeURIComponent(sanitize(query))}&bhandar=${encodeURIComponent(sanitize(selectedBhandar))}`);
      const json = await res.json();
      if (json && json.data) setData(json.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-[1400px] px-4 sm:px-6 mx-auto pb-8 pt-14 sm:pt-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-heading font-extrabold tracking-tight">
            <span className="text-[#012c77]">Issue History</span><span className="text-[#FF6B00]"> Search</span>
          </h1>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">Search book issue transaction records</span>
        </div>
        <BhandarPageSelector />
      </div>
      <div className="flex gap-3 mb-6">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          placeholder="Search by book name or member..."
          className="flex-1 border border-neutral-200 focus:border-[#012c77] rounded-xl px-4 py-3 text-[14px] outline-none bg-white/80 backdrop-blur"
        />
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSearch}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#012c77] to-[#1D4ED8] text-white rounded-xl font-bold text-[14px] shadow-md cursor-pointer"
        >
          <Search size={16} /> Search
        </motion.button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-[#012c77] border-t-transparent rounded-full animate-spin" /></div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
          <History size={40} className="mb-3 opacity-30" />
          <p className="font-semibold">Search to view records</p>
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
                <th className="px-5 py-3 font-bold text-left">Member</th>
                <th className="px-5 py-3 font-bold text-left">Action</th>
                <th className="px-5 py-3 font-bold text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className={`border-b border-neutral-50 hover:bg-blue-50/50 transition-colors ${i%2===0?'bg-white':'bg-neutral-50/40'}`}>
                  <td className="px-5 py-3.5 font-semibold text-neutral-700">{row.book_name||'-'}</td>
                  <td className="px-5 py-3.5 text-neutral-500">{row.member_name||'-'}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-600 border border-orange-100">
                      {row.action||'-'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-500">{row.created_at||'-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
