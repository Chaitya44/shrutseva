import { useState } from 'react';
import { motion } from 'framer-motion';
import { Languages, MapPin, ChevronDown, RotateCcw, Printer, Search, BookOpen, BookMarked, BookText, Sparkles, User, Edit3, Building2, Tag, Info } from 'lucide-react';
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

export default function AdvanceSearch() {
  const [activeLang, setActiveLang] = useState('Gujarati');

  return (
    <div className="w-full max-w-[1280px] px-6 sm:px-8 mx-auto pb-6 pt-14 sm:pt-16">
      
      {/* Header Section */}
      <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[34px] font-heading font-extrabold tracking-tight mb-4">
            <span className="text-[#012c77]">Advance</span>{' '}
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
      </div>

      {/* Advanced Search Form Container */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden bg-white/85 backdrop-blur-2xl rounded-[24px] py-3.5 px-4 sm:py-4 sm:px-6 shadow-[0_20px_60px_rgba(10,37,64,0.06)] border border-white mb-5"
      >
        {/* Glossy top glass reflection overlay */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white via-white/40 to-transparent pointer-events-none rounded-t-[24px]" />

        {/* Form Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-4">
          
          {/* City Dropdown */}
          <div className="xl:col-span-1 border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 active:scale-[0.98] transition-all duration-300 rounded-xl px-3 py-1.5 flex justify-between items-center cursor-pointer group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.02)] relative overflow-hidden">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-hover:text-[#1565FF] transition-colors">
                <MapPin size={13} strokeWidth={2.5} />
                <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400">City</span>
              </div>
              <span className="text-[13px] font-bold text-neutral-800">All Cities</span>
            </div>
            <ChevronDown size={15} className="text-[#0A2540]/60 group-hover:text-[#1565FF] transition-colors shrink-0 ml-1" />
            {/* Dynamic brand blue slide indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1565FF] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

          {/* Title */}
          <div className="xl:col-span-1 border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 focus-within:border-neutral-300 focus-within:bg-white transition-all duration-300 rounded-xl px-3 py-1.5 flex flex-col justify-center group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.01)] relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-focus-within:text-[#FF6B00] transition-colors">
              <BookOpen size={13} strokeWidth={2.5} />
              <label className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400">Title</label>
            </div>
            <input type="text" placeholder="Enter title..." className="w-full text-[13px] text-neutral-800 font-bold outline-none bg-transparent placeholder:text-neutral-300 placeholder:font-medium" />
            {/* Dynamic brand orange slide indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

          {/* Author */}
          <div className="xl:col-span-1 border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 focus-within:border-neutral-300 focus-within:bg-white transition-all duration-300 rounded-xl px-3 py-1.5 flex flex-col justify-center group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.01)] relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-focus-within:text-[#FF6B00] transition-colors">
              <User size={13} strokeWidth={2.5} />
              <label className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400">Author</label>
            </div>
            <input type="text" placeholder="Enter author..." className="w-full text-[13px] text-neutral-800 font-bold outline-none bg-transparent placeholder:text-neutral-300 placeholder:font-medium" />
            {/* Dynamic brand orange slide indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

          {/* Editor */}
          <div className="xl:col-span-1 border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 focus-within:border-neutral-300 focus-within:bg-white transition-all duration-300 rounded-xl px-3 py-1.5 flex flex-col justify-center group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.01)] relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-focus-within:text-[#FF6B00] transition-colors">
              <Edit3 size={13} strokeWidth={2.5} />
              <label className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400">Editor</label>
            </div>
            <input type="text" placeholder="Enter editor..." className="w-full text-[13px] text-neutral-800 font-bold outline-none bg-transparent placeholder:text-neutral-300 placeholder:font-medium" />
            {/* Dynamic brand orange slide indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

          {/* Publisher */}
          <div className="xl:col-span-1 border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 focus-within:border-neutral-300 focus-within:bg-white transition-all duration-300 rounded-xl px-3 py-1.5 flex flex-col justify-center group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.01)] relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-focus-within:text-[#FF6B00] transition-colors">
              <Building2 size={13} strokeWidth={2.5} />
              <label className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400">Publisher</label>
            </div>
            <input type="text" placeholder="Enter publisher..." className="w-full text-[13px] text-neutral-800 font-bold outline-none bg-transparent placeholder:text-neutral-300 placeholder:font-medium" />
            {/* Dynamic brand orange slide indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

          {/* Language Dropdown */}
          <div className="xl:col-span-1 border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 active:scale-[0.98] transition-all duration-300 rounded-xl px-3 py-1.5 flex justify-between items-center cursor-pointer group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.02)] relative overflow-hidden">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-hover:text-[#00ACC1] transition-colors">
                <Languages size={13} strokeWidth={2.5} />
                <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400">Language</span>
              </div>
              <span className="text-[13px] font-bold text-neutral-800">All</span>
            </div>
            <ChevronDown size={15} className="text-[#0A2540]/60 group-hover:text-[#00ACC1] transition-colors shrink-0 ml-1" />
            {/* Dynamic brand teal slide indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00ACC1] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

          {/* Subject */}
          <div className="xl:col-span-1 border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 focus-within:border-neutral-300 focus-within:bg-white transition-all duration-300 rounded-xl px-3 py-1.5 flex flex-col justify-center group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.01)] relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-focus-within:text-[#FF6B00] transition-colors">
              <Tag size={13} strokeWidth={2.5} />
              <label className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400">Subject</label>
            </div>
            <input type="text" placeholder="Enter subject..." className="w-full text-[13px] text-neutral-800 font-bold outline-none bg-transparent placeholder:text-neutral-300 placeholder:font-medium" />
            {/* Dynamic brand orange slide indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

          {/* Book Details */}
          <div className="xl:col-span-1 border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 focus-within:border-neutral-300 focus-within:bg-white transition-all duration-300 rounded-xl px-3 py-1.5 flex flex-col justify-center group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.01)] relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-focus-within:text-[#FF6B00] transition-colors">
              <Info size={13} strokeWidth={2.5} />
              <label className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400">Book Details</label>
            </div>
            <input type="text" placeholder="Enter details..." className="w-full text-[13px] text-neutral-800 font-bold outline-none bg-transparent placeholder:text-neutral-300 placeholder:font-medium" />
            {/* Dynamic brand orange slide indicator */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-100 pt-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-[#1565FF] text-white text-[14px] font-medium shadow-[0_4px_12px_rgba(21,101,255,0.25)] hover:bg-[#0D47A1] transition-colors w-full sm:w-auto">
              <Printer size={16} strokeWidth={2.5} />
              Print
            </button>
            <button className="flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-[#FF6B00] text-white text-[14px] font-medium shadow-[0_4px_12px_rgba(255,107,0,0.25)] hover:bg-[#E65A00] transition-colors w-full sm:w-auto">
              <RotateCcw size={16} strokeWidth={2.5} />
              Clear
            </button>
          </div>

          {/* Search in Result */}
          <div className="relative w-full sm:w-[280px]">
            <input 
              type="text" 
              placeholder="Search in Result" 
              className="w-full border border-neutral-200 focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/10 transition-all rounded-xl pl-4 pr-10 py-2 text-[14px] text-neutral-800 outline-none bg-white placeholder:text-neutral-400 font-medium"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A2540]">
              <Search size={18} strokeWidth={2.5} />
            </div>
          </div>
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
