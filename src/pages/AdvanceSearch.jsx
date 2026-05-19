import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, MapPin, ChevronDown, RotateCcw, Printer, Search, BookOpen, User, Edit3, Building2, Tag, Info, Loader2 } from 'lucide-react';
import BookTable from '../components/BookTable';

export default function AdvanceSearch() {
  const [activeLang, setActiveLang] = useState('Gujarati'); // Primary language context
  
  // Advanced Search Field States
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [editor, setEditor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [subject, setSubject] = useState('');
  const [particular, setParticular] = useState('');
  
  // Dropdown States
  const [cities, setCities] = useState([]);
  const [activeCity, setActiveCity] = useState('All Cities');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  
  const [activeLangDropdown, setActiveLangDropdown] = useState('All');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  
  // Results and Loaders
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInResult, setSearchInResult] = useState('');

  const cityDropdownRef = useRef(null);
  const langDropdownRef = useRef(null);

  // Fetch Cities on Mount
  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await fetch('/front/bhandars_city_dropdown');
        const json = await res.json();
        if (json && json.status && json.data) {
          const cityList = json.data.map(item => item.city).filter(Boolean);
          setCities(['All Cities', ...cityList]);
        }
      } catch (err) {
        console.error("Failed to fetch cities dropdown:", err);
      }
    }
    fetchCities();
  }, []);

  // Fetch Advanced Search Results
  const handleSearch = async () => {
    setLoading(true);
    try {
      const cityParam = activeCity === 'All Cities' ? 'all' : activeCity;
      const langParam = activeLangDropdown === 'All' ? '' : activeLangDropdown;

      let queryParams = new URLSearchParams({
        client_side: 'true',
        city: cityParam,
        title: title.trim(),
        author: author.trim(),
        editor: editor.trim(),
        publisher: publisher.trim(),
        lang_name: langParam,
        subject: subject.trim(),
        perticular: particular.trim()
      });

      const response = await fetch(`/front/quick_advance_book_search?${queryParams.toString()}`);
      const json = await response.json();
      
      if (json && json.data) {
        const mapped = json.data.map(item => ({
          id: item.master_ssid,
          master_ssid: item.master_ssid,
          name: item.book_name,
          part: item.part,
          author: item.author,
          editor: item.editor,
          language: item.lang_name,
          publisher: item.publisher
        }));
        setBooks(mapped);
      }
    } catch (err) {
      console.error("Advanced search query failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Perform search automatically when form fields or active categories change (debounced)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // Only execute if at least one field has content to search
      if (title || author || editor || publisher || subject || particular || activeCity !== 'All Cities' || activeLangDropdown !== 'All') {
        handleSearch();
      } else {
        setBooks([]);
      }
    }, 450);

    return () => clearTimeout(debounceTimer);
  }, [title, author, editor, publisher, subject, particular, activeCity, activeLangDropdown]);

  // Clear Form Fields
  const handleClear = () => {
    setTitle('');
    setAuthor('');
    setEditor('');
    setPublisher('');
    setSubject('');
    setParticular('');
    setActiveCity('All Cities');
    setActiveLangDropdown('All');
    setBooks([]);
    setSearchInResult('');
  };

  // Print Handler
  const handlePrint = () => {
    window.print();
  };

  // Click Outside Popovers to Close
  useEffect(() => {
    function handleClickOutside(event) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
        setShowLangDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Local pagination search in results
  const filteredBooks = books.filter(book => {
    if (!searchInResult.trim()) return true;
    const term = searchInResult.toLowerCase();
    return (
      (book.name && book.name.toLowerCase().includes(term)) ||
      (book.author && book.author.toLowerCase().includes(term)) ||
      (book.publisher && book.publisher.toLowerCase().includes(term)) ||
      (book.editor && book.editor.toLowerCase().includes(term))
    );
  });

  return (
    <div className="w-full max-w-[1280px] px-4 sm:px-8 mx-auto pb-6 pt-14 sm:pt-16">
      
      {/* Header Section */}
      <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[34px] font-heading font-extrabold tracking-tight mb-4">
            <span className="text-[#012c77]">Advance</span>{' '}
            <span className="text-[#FF6B00]">Book Search</span>
          </h1>

          {/* Language Toggle Context */}
          <div className="relative inline-flex items-center p-1 bg-white/80 backdrop-blur-xl rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-white overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/90 to-transparent pointer-events-none rounded-t-full" />
            <button
              onClick={() => { setActiveLang('Gujarati'); setActiveLangDropdown('Gujarati'); }}
              className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-bold tracking-wide transition-all duration-300 ${
                activeLang === 'Gujarati'
                  ? 'bg-[#00b6be] text-white shadow-[0_4px_16px_rgba(0,182,190,0.4)]'
                  : 'bg-transparent text-[#00b6be] hover:bg-neutral-50 cursor-pointer'
              }`}
            >
              <Languages size={16} strokeWidth={2.5} />
              Gujarati
            </button>
            <button
              onClick={() => { setActiveLang('Hindi'); setActiveLangDropdown('Hindi'); }}
              className={`relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-bold tracking-wide transition-all duration-300 ${
                activeLang === 'Hindi'
                  ? 'bg-[#00b6be] text-white shadow-[0_4px_16px_rgba(0,182,190,0.4)]'
                  : 'bg-transparent text-[#00b6be] hover:bg-neutral-50 cursor-pointer'
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
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white via-white/40 to-transparent pointer-events-none rounded-t-[24px]" />

        {/* Form Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-3 mb-4">
          
          {/* City Dropdown */}
          <div ref={cityDropdownRef} className="relative xl:col-span-1">
            <div 
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 active:scale-[0.98] transition-all duration-300 rounded-xl px-3 py-1.5 flex justify-between items-center cursor-pointer group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.02)] h-full overflow-hidden"
            >
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-hover:text-[#1565FF] transition-colors">
                  <MapPin size={13} strokeWidth={2.5} />
                  <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400">City</span>
                </div>
                <span className="text-[13px] font-bold text-neutral-800 truncate">{activeCity}</span>
              </div>
              <ChevronDown size={15} className="text-[#0A2540]/60 group-hover:text-[#1565FF] transition-colors shrink-0 ml-1" />
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1565FF] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>

            <AnimatePresence>
              {showCityDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-56 max-h-60 overflow-y-auto bg-white rounded-2xl shadow-xl border border-neutral-100 py-2 z-50"
                >
                  {cities.map((city, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveCity(city);
                        setShowCityDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[13px] font-bold cursor-pointer transition-colors ${
                        activeCity === city ? 'bg-[#1565FF]/10 text-[#1565FF]' : 'text-neutral-800 hover:bg-neutral-50'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Title */}
          <div className="xl:col-span-1 border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 focus-within:border-neutral-300 focus-within:bg-white transition-all duration-300 rounded-xl px-3 py-1.5 flex flex-col justify-center group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.01)] relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-focus-within:text-[#FF6B00] transition-colors">
              <BookOpen size={13} strokeWidth={2.5} />
              <label className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400">Title</label>
            </div>
            <input 
              type="text" 
              placeholder="Enter title..." 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-[13px] text-neutral-800 font-bold outline-none bg-transparent placeholder:text-neutral-300 placeholder:font-medium" 
            />
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

          {/* Author */}
          <div className="xl:col-span-1 border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 focus-within:border-neutral-300 focus-within:bg-white transition-all duration-300 rounded-xl px-3 py-1.5 flex flex-col justify-center group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.01)] relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-focus-within:text-[#FF6B00] transition-colors">
              <User size={13} strokeWidth={2.5} />
              <label className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400">Author</label>
            </div>
            <input 
              type="text" 
              placeholder="Enter author..." 
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full text-[13px] text-neutral-800 font-bold outline-none bg-transparent placeholder:text-neutral-300 placeholder:font-medium" 
            />
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

          {/* Editor */}
          <div className="xl:col-span-1 border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 focus-within:border-neutral-300 focus-within:bg-white transition-all duration-300 rounded-xl px-3 py-1.5 flex flex-col justify-center group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.01)] relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-focus-within:text-[#FF6B00] transition-colors">
              <Edit3 size={13} strokeWidth={2.5} />
              <label className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400">Editor</label>
            </div>
            <input 
              type="text" 
              placeholder="Enter editor..." 
              value={editor}
              onChange={(e) => setEditor(e.target.value)}
              className="w-full text-[13px] text-neutral-800 font-bold outline-none bg-transparent placeholder:text-neutral-300 placeholder:font-medium" 
            />
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

          {/* Publisher */}
          <div className="xl:col-span-1 border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 focus-within:border-neutral-300 focus-within:bg-white transition-all duration-300 rounded-xl px-3 py-1.5 flex flex-col justify-center group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.01)] relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-focus-within:text-[#FF6B00] transition-colors">
              <Building2 size={13} strokeWidth={2.5} />
              <label className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400">Publisher</label>
            </div>
            <input 
              type="text" 
              placeholder="Enter publisher..." 
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
              className="w-full text-[13px] text-neutral-800 font-bold outline-none bg-transparent placeholder:text-neutral-300 placeholder:font-medium" 
            />
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

          {/* Language Dropdown */}
          <div ref={langDropdownRef} className="relative xl:col-span-1">
            <div 
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 active:scale-[0.98] transition-all duration-300 rounded-xl px-3 py-1.5 flex justify-between items-center cursor-pointer group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.02)] h-full overflow-hidden"
            >
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-hover:text-[#00ACC1] transition-colors">
                  <Languages size={13} strokeWidth={2.5} />
                  <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400">Language</span>
                </div>
                <span className="text-[13px] font-bold text-neutral-800 truncate">{activeLangDropdown}</span>
              </div>
              <ChevronDown size={15} className="text-[#0A2540]/60 group-hover:text-[#00ACC1] transition-colors shrink-0 ml-1" />
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00ACC1] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>

            <AnimatePresence>
              {showLangDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100 py-2 z-50"
                >
                  {['All', 'Gujarati', 'Hindi', 'Sanskrit', 'Prakrit', 'English'].map((lang, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveLangDropdown(lang);
                        setShowLangDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[13px] font-bold cursor-pointer transition-colors ${
                        activeLangDropdown === lang ? 'bg-[#00ACC1]/10 text-[#00ACC1]' : 'text-neutral-800 hover:bg-neutral-50'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subject */}
          <div className="xl:col-span-1 border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 focus-within:border-neutral-300 focus-within:bg-white transition-all duration-300 rounded-xl px-3 py-1.5 flex flex-col justify-center group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.01)] relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-focus-within:text-[#FF6B00] transition-colors">
              <Tag size={13} strokeWidth={2.5} />
              <label className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400">Subject</label>
            </div>
            <input 
              type="text" 
              placeholder="Enter subject..." 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full text-[13px] text-neutral-800 font-bold outline-none bg-transparent placeholder:text-neutral-300 placeholder:font-medium" 
            />
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

          {/* Book Details */}
          <div className="xl:col-span-1 border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 focus-within:border-neutral-300 focus-within:bg-white transition-all duration-300 rounded-xl px-3 py-1.5 flex flex-col justify-center group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.01)] relative overflow-hidden">
            <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-focus-within:text-[#FF6B00] transition-colors">
              <Info size={13} strokeWidth={2.5} />
              <label className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400">Book Details</label>
            </div>
            <input 
              type="text" 
              placeholder="Enter details..." 
              value={particular}
              onChange={(e) => setParticular(e.target.value)}
              className="w-full text-[13px] text-neutral-800 font-bold outline-none bg-transparent placeholder:text-neutral-300 placeholder:font-medium" 
            />
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-neutral-100 pt-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-[#1565FF] text-white text-[14px] font-medium shadow-[0_4px_12px_rgba(21,101,255,0.25)] hover:bg-[#0D47A1] transition-colors w-full sm:w-auto cursor-pointer"
            >
              <Printer size={16} strokeWidth={2.5} />
              Print
            </button>
            <button 
              onClick={handleClear}
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-[#FF6B00] text-white text-[14px] font-medium shadow-[0_4px_12px_rgba(255,107,0,0.25)] hover:bg-[#E65A00] transition-colors w-full sm:w-auto cursor-pointer"
            >
              <RotateCcw size={16} strokeWidth={2.5} />
              Clear
            </button>
          </div>

          {/* Search in Result */}
          <div className="relative w-full sm:w-[280px]">
            <input 
              type="text" 
              placeholder="Search in Result" 
              value={searchInResult}
              onChange={(e) => setSearchInResult(e.target.value)}
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
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-500 font-semibold bg-white/80 backdrop-blur-md rounded-3xl border border-neutral-200/50 shadow-sm">
            <Loader2 size={36} className="text-[#00b6be] animate-spin" />
            <span className="text-[14px] tracking-wide animate-pulse">Running advanced registry search...</span>
          </div>
        ) : filteredBooks.length > 0 ? (
          <BookTable books={filteredBooks} />
        ) : title || author || editor || publisher || subject || particular || activeCity !== 'All Cities' ? (
          <div className="bg-white/80 backdrop-blur-md border border-neutral-200/50 rounded-3xl p-12 text-center shadow-sm">
            <span className="text-[36px]">🔍</span>
            <h3 className="text-[17px] font-extrabold text-[#0A2540] mt-3">No Match Found</h3>
            <p className="text-[14px] text-neutral-400 font-medium mt-1">Try adjusting the filter criteria or broadening your search fields.</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-md border border-neutral-200/50 rounded-3xl p-12 text-center shadow-sm">
            <span className="text-[36px]">📚</span>
            <h3 className="text-[17px] font-extrabold text-[#0A2540] mt-3">Advanced Book Search</h3>
            <p className="text-[14px] text-neutral-400 font-medium mt-1">Fill in any search parameters above to perform highly-targeted multi-field searches.</p>
          </div>
        )}
      </motion.div>

    </div>
  );
}
