import { useState } from 'react';
import { motion } from 'framer-motion';
import { History, Search, Printer, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BhandarPageSelector from '../components/BhandarPageSelector';
import TransliteratedInput from '../components/TransliteratedInput';

function sanitize(str) { return String(str || '').replace(/<[^>]*>/g, '').trim(); }

export default function BookIssueHistorySearch() {
  const { selectedBhandar } = useAuth();

  // Search fields matching screenshot exactly
  const [bookQuery,     setBookQuery]     = useState('');
  const [memberQuery,   setMemberQuery]   = useState('');
  const [issueFrom,     setIssueFrom]     = useState('');
  const [issueTill,     setIssueTill]     = useState('');
  const [returnFrom,    setReturnFrom]    = useState('');
  const [returnTill,    setReturnTill]    = useState('');

  const [data,     setData]     = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({
        book:         sanitize(bookQuery),
        member:       sanitize(memberQuery),
        issue_from:   sanitize(issueFrom),
        issue_till:   sanitize(issueTill),
        return_from:  sanitize(returnFrom),
        return_till:  sanitize(returnTill),
        bhandar:      sanitize(selectedBhandar),
        client_side:  'true',
      });
      const res  = await fetch(`/front/book_issue_history_search?${params}`);
      const json = await res.json();
      if (json && json.data) setData(json.data);
      else setData([]);
    } catch (e) { console.error(e); setData([]); }
    finally { setLoading(false); }
  };

  const handleReset = () => {
    setBookQuery(''); setMemberQuery('');
    setIssueFrom(''); setIssueTill('');
    setReturnFrom(''); setReturnTill('');
    setData([]); setSearched(false);
  };

  return (
    <div className="w-full max-w-[1400px] px-4 sm:px-6 mx-auto pb-8 pt-14 sm:pt-16">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-heading font-extrabold tracking-tight">
            <span className="text-[#012c77]">Book Issue</span>
            <span className="text-[#FF6B00]"> History Search</span>
          </h1>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">
            Search book issue and return transaction records
          </span>
        </div>
        <BhandarPageSelector />
      </div>

      {/* Search Panel */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm p-5 mb-6 flex flex-col gap-4">

        {/* Book search */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-wide">Book</label>
          <TransliteratedInput
            value={bookQuery}
            onChange={setBookQuery}
            placeholder="Search by No / Name / Kruti / Author / Subject / Notes..."
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* Member search */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-wide">Member</label>
          <TransliteratedInput
            value={memberQuery}
            onChange={setMemberQuery}
            placeholder="Search by Id / Name / Mobile / Email / Address / Notes..."
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>

        {/* Date filters — 2 rows matching screenshot */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-wide">Issued From</label>
            <input type="date" value={issueFrom} onChange={e => setIssueFrom(e.target.value)}
              className="border border-neutral-200 focus:border-[#012c77] rounded-xl px-3 py-2.5 text-[13px] outline-none bg-white transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-wide">Issued Till</label>
            <input type="date" value={issueTill} onChange={e => setIssueTill(e.target.value)}
              className="border border-neutral-200 focus:border-[#012c77] rounded-xl px-3 py-2.5 text-[13px] outline-none bg-white transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-wide">Returned From</label>
            <input type="date" value={returnFrom} onChange={e => setReturnFrom(e.target.value)}
              className="border border-neutral-200 focus:border-[#012c77] rounded-xl px-3 py-2.5 text-[13px] outline-none bg-white transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-bold text-neutral-500 uppercase tracking-wide">Returned Till</label>
            <input type="date" value={returnTill} onChange={e => setReturnTill(e.target.value)}
              className="border border-neutral-200 focus:border-[#012c77] rounded-xl px-3 py-2.5 text-[13px] outline-none bg-white transition-colors" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 justify-end">
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer">
            <RotateCcw size={14} /> Reset
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer">
            <Printer size={14} /> Print
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleSearch}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#012c77] to-[#1D4ED8] text-white rounded-xl font-bold text-[13px] shadow-md cursor-pointer">
            <Search size={14} /> Search
          </motion.button>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-[#012c77] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !searched ? (
        <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
          <History size={40} className="mb-3 opacity-30" />
          <p className="font-semibold">Fill filters above and click Search</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
          <History size={40} className="mb-3 opacity-30" />
          <p className="font-semibold">No records found</p>
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
                  <th className="px-4 py-3 font-bold text-left whitespace-nowrap">Kruti</th>
                  <th className="px-4 py-3 font-bold text-left whitespace-nowrap">Author</th>
                  <th className="px-4 py-3 font-bold text-left whitespace-nowrap">Subject</th>
                  <th className="px-4 py-3 font-bold text-left whitespace-nowrap">Notes</th>
                  <th className="px-4 py-3 font-bold text-left whitespace-nowrap">Issued To</th>
                  <th className="px-4 py-3 font-bold text-left whitespace-nowrap">Issued Date</th>
                  <th className="px-4 py-3 font-bold text-left whitespace-nowrap">Return Date</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className={`border-b border-neutral-50 hover:bg-blue-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/40'}`}>
                    <td className="px-4 py-3 font-mono text-[#012c77] font-bold whitespace-nowrap">{row.SSID || row.ssid || row.number || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-neutral-800 max-w-[140px] truncate">{row.book_name || row.title || '-'}</td>
                    <td className="px-4 py-3 text-neutral-600 max-w-[140px] truncate">{row.kruti || row.Kruti || '-'}</td>
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{row.author || '-'}</td>
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{row.subject || '-'}</td>
                    <td className="px-4 py-3 text-neutral-500 max-w-[140px] truncate">{row.notes || '-'}</td>
                    <td className="px-4 py-3 font-semibold text-[#012c77] whitespace-nowrap">{row.issued_to || row.member_name || '-'}</td>
                    <td className="px-4 py-3 text-neutral-500 whitespace-nowrap">{row.issued_date || row.issue_date || row.created_at || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {row.return_date || row.returned_at
                        ? <span className="text-emerald-600 font-semibold">{row.return_date || row.returned_at}</span>
                        : <span className="text-amber-500 font-semibold text-[11px]">Not returned</span>
                      }
                    </td>
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
