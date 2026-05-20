import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BhandarPageSelector from '../components/BhandarPageSelector';

function sanitize(str) { return String(str || '').replace(/<[^>]*>/g, '').trim(); }

export default function Members() {
  const { selectedBhandar } = useAuth();
  const [members, setMembers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/front/member_autocomplete?query=${encodeURIComponent(sanitize(query))}&bhandar=${encodeURIComponent(sanitize(selectedBhandar))}`);
        const json = await res.json();
        if (active && json && json.data) setMembers(json.data);
      } catch(e) { console.error(e); }
      finally { if(active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, [selectedBhandar, query]);

  return (
    <div className="w-full max-w-[1400px] px-4 sm:px-6 mx-auto pb-8 pt-14 sm:pt-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-heading font-extrabold tracking-tight">
            <span className="text-[#012c77]">Library</span><span className="text-[#FF6B00]"> Members</span>
          </h1>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">Registered member directory</span>
        </div>
        <BhandarPageSelector />
      </div>
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search members..."
          className="w-full max-w-md border border-neutral-200 focus:border-[#012c77] rounded-xl pl-10 pr-4 py-3 text-[14px] outline-none bg-white/80 backdrop-blur"
        />
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-[#012c77] border-t-transparent rounded-full animate-spin" /></div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
          <Users size={40} className="mb-3 opacity-30" />
          <p className="font-semibold">No members found</p>
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
                <th className="px-5 py-3 font-bold text-left">Name</th>
                <th className="px-5 py-3 font-bold text-left">Mobile</th>
                <th className="px-5 py-3 font-bold text-left">Address</th>
                <th className="px-5 py-3 font-bold text-left">Books Issued</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={i} className={`border-b border-neutral-50 hover:bg-blue-50/50 transition-colors ${i%2===0?'bg-white':'bg-neutral-50/40'}`}>
                  <td className="px-5 py-3.5 font-semibold text-neutral-700">{m.member_name||m.name||'-'}</td>
                  <td className="px-5 py-3.5 text-neutral-500">{m.mobile||'-'}</td>
                  <td className="px-5 py-3.5 text-neutral-500">{m.address||'-'}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                      {m.books_issued||'0'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}
