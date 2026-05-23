import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookMarked, Search, Printer, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BhandarPageSelector from '../components/BhandarPageSelector';
import TransliteratedInput from '../components/TransliteratedInput';

function sanitize(str) { return String(str || '').replace(/<[^>]*>/g, '').trim(); }

export default function IssuedBooks() {
  const { selectedBhandar } = useAuth();
  const [keyword, setKeyword]     = useState('');
  const [issueFrom, setIssueFrom] = useState('');
  const [issueTill, setIssueTill] = useState('');
  const [data, setData]           = useState([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        search:      sanitize(keyword),
        issue_from:  sanitize(issueFrom),
        issue_till:  sanitize(issueTill),
        bhandar_code: sanitize(selectedBhandar),
      });
      const res  = await fetch(`/front/get-bookissue-list?${params}`);
      const json = await res.json();
      if (json && json.data) setData(json.data);
      else setData([]);
    } catch (e) { console.error(e); setData([]); }
    finally { setLoading(false); }
  };

  const handleReset = () => {
    setKeyword(''); setIssueFrom(''); setIssueTill('');
    setData([]); setSearched(false);
  };

  const handlePrint = () => window.print();

  return (
    <div className="w-full max-w-[1400px] px-4 sm:px-6 mx-auto pb-8 pt-14 sm:pt-16">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-heading font-extrabold tracking-tight">
            <span className="text-[#012c77]">Issued</span>
            <span className="text-[#FF6B00]"> Books</span>
          </h1>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
            Books currently issued to members
          </span>
        </div>
        <BhandarPageSelector />
      </div>

      {/* Search Panel */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm p-5 mb-6 flex flex-col gap-4">

        {/* Keyword search with transliteration */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-wide">
            Search
          </label>
          <TransliteratedInput
            value={keyword}
            onChange={setKeyword}
            placeholder="Search by Number, Title, Author, Issued to Name, Email..."
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* Date filters row */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-wide">Issue From</label>
            <input
              type="date"
              value={issueFrom}
              onChange={e => setIssueFrom(e.target.value)}
              className="border border-neutral-200 focus:border-[#012c77] rounded-xl px-3 py-2.5 text-[13px] outline-none bg-white transition-colors"
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-wide">Issued Till</label>
            <input
              type="date"
              value={issueTill}
              onChange={e => setIssueTill(e.target.value)}
              className="border border-neutral-200 focus:border-[#012c77] rounded-xl px-3 py-2.5 text-[13px] outline-none bg-white transition-colors"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 ml-auto">
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <RotateCcw size={14} /> Reset
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <Printer size={14} /> Print
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleSearch}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#012c77] to-[#1D4ED8] text-white rounded-xl font-bold text-[13px] shadow-md cursor-pointer"
            >
              <Search size={14} /> Search
            </motion.button>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-[#012c77] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !searched ? (
        <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
          <BookMarked size={40} className="mb-3 opacity-30" />
          <p className="font-semibold">Use filters above and click Search</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
          <BookMarked size={40} className="mb-3 opacity-30" />
          <p className="font-semibold">No issued books found</p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden rounded-2xl border border-white/60 shadow-sm bg-white/80 backdrop-blur-xl"
        >
          <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
            <span className="text-[12px] font-bold text-neutral-500">
              Showing {data.length} record{data.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gradient-to-r from-[#012c77] to-[#1D4ED8] text-white">
                  <th className="px-4 py-3 font-bold text-left whitespace-nowrap">Number</th>
                  <th className="px-4 py-3 font-bold text-left whitespace-nowrap">Title</th>
                  <th className="px-4 py-3 font-bold text-left whitespace-nowrap">Author</th>
                  <th className="px-4 py-3 font-bold text-left whitespace-nowrap">Language</th>
                  <th className="px-4 py-3 font-bold text-left whitespace-nowrap">Publisher</th>
                  <th className="px-4 py-3 font-bold text-left whitespace-nowrap">Subject</th>
                  <th className="px-4 py-3 font-bold text-left whitespace-nowrap">Issued To</th>
                  <th className="px-4 py-3 font-bold text-left whitespace-nowrap">Email</th>
                  <th className="px-4 py-3 font-bold text-left whitespace-nowrap">Notes</th>
                  <th className="px-4 py-3 font-bold text-left whitespace-nowrap">Issued On</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className={`border-b border-neutral-50 hover:bg-blue-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/40'}`}>
                    <td className="px-4 py-3 font-mono text-[#012c77] font-bold whitespace-nowrap">{row.SSID || row.ssid || row.number || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-neutral-800 max-w-[180px] truncate">{row.book_name || row.title || '-'}</td>
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{row.author || '-'}</td>
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{row.lang_name || row.language || '-'}</td>
                    <td className="px-4 py-3 text-neutral-500 max-w-[140px] truncate">{row.publisher || '-'}</td>
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{row.subject || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-[#012c77] whitespace-nowrap">{row.issued_to || row.member_name || '-'}</td>
                    <td className="px-4 py-3 text-neutral-400 text-[12px] whitespace-nowrap">{row.email || '-'}</td>
                    <td className="px-4 py-3 text-neutral-500 max-w-[140px] truncate">{row.notes || '-'}</td>
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{row.issued_on || row.issue_date || row.created_at || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
