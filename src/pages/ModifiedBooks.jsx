import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileEdit } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BhandarPageSelector from '../components/BhandarPageSelector';

function sanitize(str) { return String(str || '').replace(/<[^>]*>/g, '').trim(); }

export default function ModifiedBooks() {
  const { selectedBhandar } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const bhandar = sanitize(selectedBhandar);
        const res = await fetch(`/front/modifiedbooks?bhandar_code=${encodeURIComponent(bhandar)}`);
        const json = await res.json();
        if (active && json && json.data) setData(json.data);
      } catch(e) { console.error(e); }
      finally { if(active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [selectedBhandar]);

  return (
    <div className="w-full max-w-[1400px] px-4 sm:px-6 mx-auto pb-8 pt-14 sm:pt-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-heading font-extrabold tracking-tight">
            <span className="text-[#012c77]">Modified</span><span className="text-[#FF6B00]"> Books</span>
          </h1>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">Recently edited catalog entries</span>
        </div>
        <BhandarPageSelector />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-[#012c77] border-t-transparent rounded-full animate-spin" /></div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
          <FileEdit size={40} className="mb-3 opacity-30" />
          <p className="font-semibold">No data found</p>
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
                <th className="px-5 py-3 font-bold text-left">Modified At</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className={`border-b border-neutral-50 hover:bg-blue-50/50 transition-colors ${i%2===0?'bg-white':'bg-neutral-50/40'}`}>
                  <td className="px-5 py-3.5 font-semibold text-neutral-700">{row.book_name||'-'}</td>
                  <td className="px-5 py-3.5 text-neutral-500">{row.author||'-'}</td>
                  <td className="px-5 py-3.5 text-neutral-500">{row.lang_name||'-'}</td>
                  <td className="px-5 py-3.5 text-neutral-500">{row.updated_at||'-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
