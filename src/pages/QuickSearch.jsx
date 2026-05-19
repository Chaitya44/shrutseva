import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, ChevronDown, Languages, Sparkles, Loader2 } from 'lucide-react';
import BookTable from '../components/BookTable';

export default function QuickSearch() {
  const [activeLang, setActiveLang] = useState('Gujarati');
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [activeCity, setActiveCity] = useState('All Cities');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  
  const dropdownRef = useRef(null);

  // Fetch Cities Dropdown on Mount
  useEffect(() => {
    async function fetchCities() {
      try {
        const res = await fetch('/front/bhandars_city_dropdown');
        const json = await res.json();
        if (json && json.status && json.data) {
          // Extract cities
          const cityList = json.data.map(item => item.city).filter(Boolean);
          setCities(['All Cities', ...cityList]);
        }
      } catch (err) {
        console.error("Failed to fetch cities dropdown:", err);
      }
    }
    fetchCities();
  }, []);

  // Fetch Books dynamically based on Query, Language, and City
  useEffect(() => {
    let active = true;
    const delayDebounce = setTimeout(async () => {
      // If query is empty, we don't need to load or can load all
      if (!searchQuery.trim()) {
        setBooks([]);
        return;
      }

      setLoading(true);
      try {
        const endpoint = activeLang === 'Hindi' 
          ? '/front/quick_hindi_book_search' 
          : '/front/quick_book_search';
          
        const cityParam = activeCity === 'All Cities' ? 'all' : activeCity;
        const url = `${endpoint}?quick_search=${encodeURIComponent(searchQuery)}&city=${encodeURIComponent(cityParam)}&client_side=true`;

        const res = await fetch(url);
        const json = await res.json();
        
        if (active && json && json.data) {
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
        console.error("Failed to search books:", err);
      } finally {
        if (active) setLoading(false);
      }
    }, 400); // 400ms debounce to prevent spamming the database

    return () => {
      active = false;
      clearTimeout(delayDebounce);
    };
  }, [searchQuery, activeLang, activeCity]);

  // Click Outside to Close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
                : 'bg-transparent text-[#00b6be] hover:bg-neutral-50 cursor-pointer'
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
                : 'bg-transparent text-[#00b6be] hover:bg-neutral-50 cursor-pointer'
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
              {loading ? (
                <Loader2 size={18} className="text-[#0F766E] animate-spin" strokeWidth={2.5} />
              ) : (
                <Search size={18} className="text-[#0F766E]" strokeWidth={2.5} />
              )}
            </div>

            {/* Input Field */}
            <input
              type="text"
              placeholder="Enter book name, alternate name, or kruti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative z-10 flex-1 bg-transparent border-none outline-none px-3 sm:px-4 py-2 sm:py-0 text-[15px] sm:text-[16px] text-[#0A2540] placeholder:text-neutral-400 font-medium w-full"
            />
          </div>

          {/* Divider */}
          <div className="relative z-10 w-full h-px sm:w-px sm:h-6 bg-neutral-200 mx-0 sm:mx-2 my-1 sm:my-0 shrink-0"></div>

          {/* City Selector with Dropdown */}
          <div className="relative shrink-0 w-full sm:w-auto" ref={dropdownRef}>
            <button 
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="flex items-center justify-between sm:justify-start gap-3 px-3 sm:px-4 py-2 sm:py-1.5 hover:bg-neutral-50 rounded-full transition-colors shrink-0 w-full sm:w-auto cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <MapPin size={18} className="text-[#0F766E]" strokeWidth={2} />
                <span className="text-[#0A2540] font-semibold text-[14px] sm:text-[15px]">{activeCity}</span>
              </div>
              <ChevronDown size={18} className="text-[#0A2540] transition-transform duration-200" style={{ transform: showCityDropdown ? 'rotate(180deg)' : 'none' }} strokeWidth={2.5} />
            </button>

            {/* Premium Cities Popover */}
            <AnimatePresence>
              {showCityDropdown && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-56 max-h-60 overflow-y-auto bg-white/95 backdrop-blur-2xl rounded-2xl shadow-xl border border-neutral-100 py-2 z-50 scrollbar-thin"
                >
                  {cities.map((city, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveCity(city);
                        setShowCityDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[14px] font-bold transition-colors cursor-pointer ${
                        activeCity === city
                          ? 'bg-[#00b6be]/10 text-[#00b6be]'
                          : 'text-[#0A2540] hover:bg-neutral-50'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
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
        {searchQuery.trim() ? (
          books.length > 0 ? (
            <BookTable books={books} />
          ) : !loading ? (
            <div className="bg-white/80 backdrop-blur-md border border-neutral-200/50 rounded-3xl p-12 text-center shadow-sm">
              <span className="text-[36px]">🔍</span>
              <h3 className="text-[17px] font-extrabold text-[#0A2540] mt-3">No Books Found</h3>
              <p className="text-[14px] text-neutral-400 font-medium mt-1">Try modifying your search term or selecting a different city.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-neutral-500 font-semibold bg-white/80 backdrop-blur-md rounded-3xl border border-neutral-200/50 shadow-sm">
              <Loader2 size={36} className="text-[#00b6be] animate-spin" />
              <span className="text-[14px] tracking-wide animate-pulse">Searching book registry...</span>
            </div>
          )
        ) : (
          <div className="bg-white/80 backdrop-blur-md border border-neutral-200/50 rounded-3xl p-12 text-center shadow-sm">
            <span className="text-[36px]">📚</span>
            <h3 className="text-[17px] font-extrabold text-[#0A2540] mt-3">Search ShrutSeva Registry</h3>
            <p className="text-[14px] text-neutral-400 font-medium mt-1">Type in a book name above to search across our massive multi-city library archives.</p>
          </div>
        )}
      </motion.div>

    </div>
  );
}
