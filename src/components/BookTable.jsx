import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import ExpandedBookDetails from './ExpandedBookDetails';

export default function BookTable({ books }) {
  const [expandedRowId, setExpandedRowId] = useState(null);

  const toggleRow = (id) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };

  return (
    <div className="w-full flex flex-col bg-white rounded-[24px] shadow-[0_16px_40px_rgba(10,37,64,0.08)] border border-neutral-100 overflow-hidden">
      
      {/* Tabular Desktop View (md and larger) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gradient-to-r from-[#1D4ED8] to-[#00b6be] text-white">
              <th className="px-5 py-3 text-[13px] font-bold whitespace-nowrap w-[80px]">Expand ↕</th>
              <th className="px-5 py-3 text-[13px] font-bold whitespace-nowrap">Name ↕</th>
              <th className="px-5 py-3 text-[13px] font-bold whitespace-nowrap">Part ↕</th>
              <th className="px-5 py-3 text-[13px] font-bold whitespace-nowrap">Author ↕</th>
              <th className="px-5 py-3 text-[13px] font-bold whitespace-nowrap">Editor ↕</th>
              <th className="px-5 py-3 text-[13px] font-bold whitespace-nowrap w-[100px] text-center">Language ↕</th>
              <th className="px-5 py-3 text-[13px] font-bold whitespace-nowrap">Publisher ↕</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, index) => {
              const isExpanded = expandedRowId === book.id;
              
              return (
                <React.Fragment key={book.id}>
                  {/* Main Row */}
                  <tr className={`border-b border-neutral-100 transition-colors ${isExpanded ? 'bg-[#F8FAFC]' : 'hover:bg-neutral-50 bg-white'}`}>
                    <td className="px-5 py-4 align-middle">
                      <button
                        onClick={() => toggleRow(book.id)}
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
                        <div className="flex items-center">
                          <div className="w-1 h-6 bg-[#1565FF] rounded-r-md -ml-5 mr-4 shrink-0"></div>
                          <span className="text-[14px] font-bold text-[#0A2540]">{book.name}</span>
                        </div>
                      ) : (
                        <span className="text-[14px] font-bold text-[#0A2540]">{book.name}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[14px] font-medium text-neutral-600">{book.part || '-'}</td>
                    <td className="px-5 py-4 text-[14px] font-medium text-neutral-600">{book.author || '-'}</td>
                    <td className="px-5 py-4 text-[14px] font-medium text-neutral-600">{book.editor || '-'}</td>
                    <td className="px-5 py-4 text-center">
                      {book.language ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-[#00b6be]/15 text-[#0F766E] font-bold text-[11px]">
                          {book.language}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="px-5 py-4 text-[14px] font-medium text-neutral-600">{book.publisher || '-'}</td>
                  </tr>

                  {/* Expanded Content */}
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
                            <ExpandedBookDetails book={book} />
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

      {/* Responsive Card List View (Mobile only, < md) */}
      <div className="block md:hidden divide-y divide-neutral-100">
        {books.map((book) => {
          const isExpanded = expandedRowId === book.id;
          return (
            <div key={book.id} className={`p-4 transition-all duration-300 ${isExpanded ? 'bg-[#F8FAFC]' : 'bg-white'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0" onClick={() => toggleRow(book.id)}>
                  <div className="flex items-center gap-2 mb-1">
                    {book.language ? (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded bg-[#00b6be]/15 text-[#0F766E] font-bold text-[10px] uppercase tracking-wider">
                        {book.language}
                      </span>
                    ) : null}
                    {book.part ? (
                      <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Part {book.part}</span>
                    ) : null}
                  </div>
                  <h4 className="text-[14.5px] font-extrabold text-[#0A2540] hover:text-[#1565FF] transition-colors leading-snug cursor-pointer">
                    {book.name}
                  </h4>
                  <p className="text-[12px] text-neutral-500 font-medium mt-1">
                    <span className="text-neutral-400 font-bold uppercase text-[9.5px] tracking-wider mr-1">Author:</span> 
                    {book.author || 'Unknown'}
                  </p>
                </div>
                <button
                  onClick={() => toggleRow(book.id)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all shadow-sm ${
                    isExpanded 
                      ? 'bg-[#1565FF] text-white rotate-180' 
                      : 'bg-[#00b6be] text-white hover:bg-[#009ca3]'
                  }`}
                >
                  {isExpanded ? <Minus size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
                </button>
              </div>
              
              {/* Expanded Card Details for Mobile */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="mt-4 border-t border-neutral-100 pt-3 overflow-hidden"
                  >
                    <ExpandedBookDetails book={book} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Pagination Footer */}
      <div className="bg-[#F8FAFC] border-t border-neutral-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-[13px] font-bold text-[#0D47A1]">
          Showing 1 to 25 of 4811 entries
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
          <button className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-white hover:text-[#1565FF] hover:border-[#1565FF]/30 transition-colors bg-transparent shrink-0">
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
          
          <button className="w-8 h-8 rounded-lg bg-[#1565FF] text-white flex items-center justify-center text-[13px] font-bold shadow-md shrink-0">
            1
          </button>
          <button className="w-8 h-8 rounded-lg bg-[#00b6be] text-white flex items-center justify-center text-[13px] font-bold shadow-md shrink-0">
            2
          </button>
          <button className="w-8 h-8 rounded-lg bg-[#FF6B00] text-white flex items-center justify-center text-[13px] font-bold shadow-md shrink-0">
            3
          </button>
          <button className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-white hover:text-[#1565FF] hover:border-[#1565FF]/30 transition-colors bg-transparent text-[13px] font-bold shrink-0">
            4
          </button>
          <button className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-white hover:text-[#1565FF] hover:border-[#1565FF]/30 transition-colors bg-transparent text-[13px] font-bold shrink-0">
            5
          </button>
          
          <div className="w-8 h-8 flex items-center justify-center text-neutral-400 shrink-0">
            <MoreHorizontal size={16} />
          </div>
          
          <button className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-white hover:text-[#1565FF] hover:border-[#1565FF]/30 transition-colors bg-transparent text-[13px] font-bold shrink-0">
            193
          </button>
          
          <button className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-white hover:text-[#1565FF] hover:border-[#1565FF]/30 transition-colors bg-transparent shrink-0">
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
