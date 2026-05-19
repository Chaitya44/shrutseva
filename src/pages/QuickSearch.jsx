import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, ChevronDown, Languages, BookOpen, Sparkles, BookText, BookMarked } from 'lucide-react';
import BookTable from '../components/BookTable';

const mockBooks = [
  {
    id: 1,
    name: '20 Key For Success In Job And Career',
    part: '-',
    alternateName: '-',
    kruti: '-',
    author: 'લે. માઈક મુરડોક',
    editor: '-',
    language: 'E',
    languageFull: 'English',
    publisher: 'પુસ્તક મહલ',
    page: '-',
    year: '-',
    edition: '-',
    subject: '-',
    note: '-',
    particular: '-',
    bhandars: [
      { bookNumber: 'C1410', name: 'CHIDANANDA CHITKOSH', city: 'PUNE', contact: '9096711222' }
    ]
  },
  {
    id: 2,
    name: '30 Stories of Shantrujay',
    part: '-',
    alternateName: '-',
    kruti: '-',
    author: 'સં. શશીકાંત લિ.',
    editor: '-',
    language: 'E',
    languageFull: 'English',
    publisher: 'આધ્યાત્મિક શિક્ષણ કેન્દ્ર',
    page: '-',
    year: '-',
    edition: '-',
    subject: '-',
    note: '-',
    particular: '-',
    bhandars: []
  }
];

export default function QuickSearch() {
  const [activeLang, setActiveLang] = useState('Gujarati');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-full max-w-[1120px] px-4 sm:px-8 mx-auto pb-6 pt-14 sm:pt-16">
      
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-[28px] sm:text-[34px] font-heading font-extrabold tracking-tight mb-4">
          <span className="text-[#012c77]">Quick</span>{' '}
          <span className="text-[#FF6B00]">Book Search</span>
        </h1>

        {/* Language Toggle */}
        <div className="relative inline-flex items-center p-1 bg-white/80 backdrop-blur-xl rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-white overflow-hidden">
          {/* Glossy top glass reflection overlay */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/90 to-transparent pointer-events-none rounded-t-full" />
          <button
            onClick={() => setActiveLang('Gujarati')}
            className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-bold tracking-wide transition-all duration-300 ${
              activeLang === 'Gujarati'
                ? 'bg-[#00b6be] text-white shadow-[0_4px_16px_rgba(0,182,190,0.4)]'
                : 'bg-transparent text-[#00b6be] hover:bg-neutral-50'
            }`}
          >
            <Languages size={16} strokeWidth={2.5} />
            Gujarati
          </button>
          <button
            onClick={() => setActiveLang('Hindi')}
            className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-bold tracking-wide transition-all duration-300 ${
              activeLang === 'Hindi'
                ? 'bg-[#00b6be] text-white shadow-[0_4px_16px_rgba(0,182,190,0.4)]'
                : 'bg-transparent text-[#00b6be] hover:bg-neutral-50'
            }`}
          >
            <Languages size={16} strokeWidth={2.5} />
            Hindi
          </button>
        </div>
      </div>

      {/* Search Bar Container */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative mb-8"
      >
        <div className="relative overflow-hidden flex flex-col sm:flex-row items-stretch sm:items-center bg-white/90 backdrop-blur-2xl rounded-[24px] sm:rounded-full p-1 sm:p-1.5 shadow-[0_16px_40px_rgba(20,184,166,0.18)] border border-white">
          {/* Glossy top glass reflection overlay */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/80 to-transparent pointer-events-none sm:rounded-t-full rounded-t-[24px]" />
          
          <div className="flex items-center flex-1 w-full sm:w-auto">
            {/* Search Icon Container */}
            <div className="relative z-10 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#14B8A6]/10 flex items-center justify-center shrink-0 ml-1">
              <Search size={18} className="text-[#0F766E]" strokeWidth={2.5} />
            </div>

            {/* Input Field */}
            <input
              type="text"
              placeholder="Enter book name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative z-10 flex-1 bg-transparent border-none outline-none px-3 sm:px-4 py-2 sm:py-0 text-[15px] sm:text-[16px] text-[#0A2540] placeholder:text-neutral-400 font-medium w-full"
            />
          </div>

          {/* Divider */}
          <div className="relative z-10 w-full h-px sm:w-px sm:h-6 bg-neutral-200 mx-0 sm:mx-2 my-1 sm:my-0 shrink-0"></div>

          {/* City Selector */}
          <button className="flex items-center justify-between sm:justify-start gap-3 px-3 sm:px-4 py-2 sm:py-1.5 hover:bg-neutral-50 rounded-full transition-colors shrink-0 w-full sm:w-auto">
            <div className="flex items-center gap-3">
              <MapPin size={18} className="text-[#0F766E]" strokeWidth={2} />
              <span className="text-[#0A2540] font-semibold text-[14px] sm:text-[15px]">All Cities</span>
            </div>
            <ChevronDown size={18} className="text-[#0A2540]" strokeWidth={2.5} />
          </button>
        </div>
      </motion.div>

      {/* Results Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full"
      >
        <BookTable books={mockBooks} />
      </motion.div>

    </div>
  );
}
