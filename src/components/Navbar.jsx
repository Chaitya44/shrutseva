import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Menu, X, LogOut, BookPlus, BarChart2, MapPin, ChevronDown, Check } from 'lucide-react';
import logo from '../assets/logo.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_LINKS = [
  { label: 'Home',           href: '/' },
  { label: 'About Us',       href: '/about' },
  { label: 'Quick Search',   href: '/quick-search' },
  { label: 'Advance Search', href: '/advance-search' },
  { label: 'Contact',        href: '/contact' },
];
const BHANDAR_OPTIONS = [
  'Sardar Nagar : Bardoli',
  'Jawahar Nagar : Surat',
  'Main Bhandar : Ahmedabad'
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bhandarDropdownOpen, setBhandarDropdownOpen] = useState(false);
  const bhandarRef = useRef(null);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { isLoggedIn, logout, selectedBhandar, setSelectedBhandar } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (bhandarRef.current && !bhandarRef.current.contains(event.target)) {
        setBhandarDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const showSelectorInNavbar = location.pathname === '/' || location.pathname === '/about';

  const links = isLoggedIn
    ? [
        ...NAV_LINKS,
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Add Book', href: '/add-book' }
      ]
    : NAV_LINKS;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 ${scrolled ? 'py-0' : 'py-3 sm:py-4 px-4 sm:px-6'}`}
    >
      <nav
        className={`
          relative flex items-center justify-between w-full transition-all duration-300
          ${scrolled
            ? 'h-[72px] bg-white/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-b border-black/5 px-6 sm:px-12 max-w-full rounded-none'
            : 'h-[72px] bg-white/70 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.03)] border border-white/60 px-6 sm:px-8 max-w-[1400px] rounded-2xl'
          }
        `}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group" aria-label="ShrutSeva Home">
          <motion.img
            src={logo} alt="ShrutSeva"
            whileHover={{ scale: 1.05, rotate: 2 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            className="h-11 sm:h-13 w-auto object-contain filter drop-shadow-sm"
          />
          <span className="text-[23px] sm:text-[25px] font-heading font-extrabold tracking-tight text-[#012c77] leading-none">
            Shrut<span className="text-[#FF6B00]">Seva</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-4 xl:gap-6">
          {links.map((link) => {
            const isActive = link.href === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(link.href.split('#')[0]) && link.href.split('#')[0] !== '/';
            return (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className={`
                    relative py-2 text-[14px] font-semibold font-sans transition-colors duration-200
                    group flex flex-col items-center
                    ${isActive
                      ? 'text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-900'
                    }
                  `}
                >
                  {link.label}
                  {isActive ? (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-1.5 h-[2px] w-4 rounded-full bg-[#FF6B00]"
                    />
                  ) : (
                    <span className="absolute -bottom-1.5 h-[2px] w-0 rounded-full bg-neutral-300 transition-all duration-300 group-hover:w-4" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Auth Button */}
        {isLoggedIn ? (
          <div className="hidden lg:flex items-center gap-3">

            <div className="relative z-35" ref={bhandarRef}>
              <motion.button
                onClick={() => setBhandarDropdownOpen(!bhandarDropdownOpen)}
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-between gap-2.5 px-4 py-2 bg-white/95 backdrop-blur-md rounded-full border border-neutral-200 hover:border-[#2563EB] active:scale-[0.98] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.02)] cursor-pointer text-[12.5px] font-heading font-extrabold text-[#0A2540] min-w-0"
              >
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-[#2563EB] shrink-0" strokeWidth={2.5} />
                  <span>{selectedBhandar}</span>
                </div>
                <ChevronDown size={14} className={`text-[#0A2540] shrink-0 transition-transform duration-300 ${bhandarDropdownOpen ? 'rotate-180' : ''}`} />
              </motion.button>

              <AnimatePresence>
                {bhandarDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-[220px] bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-2xl p-2 shadow-[0_10px_30px_rgba(10,37,64,0.08)] flex flex-col gap-1 z-40 origin-top-right overflow-hidden"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Select Bhandar</div>
                    {BHANDAR_OPTIONS.map((option) => {
                      const isSelected = selectedBhandar === option;
                      return (
                        <button
                          key={option}
                          onClick={() => {
                            setSelectedBhandar(option);
                            setBhandarDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-[12.5px] font-bold text-left transition-colors cursor-pointer w-full
                            ${isSelected 
                              ? 'bg-[#2563EB]/10 text-[#2563EB]' 
                              : 'text-[#0A2540] hover:bg-neutral-50'
                            }`}
                        >
                          <span className="truncate">{option}</span>
                          {isSelected && <Check size={14} strokeWidth={3} className="shrink-0" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {/* Logout */}
            <motion.button
              onClick={handleLogout}
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden flex items-center gap-2 px-5 py-2 rounded-full text-white text-[14px] font-semibold font-sans
                bg-gradient-to-r from-[#E8380D] to-[#FF6B00]
                shadow-[0_4px_12px_rgba(232,56,13,0.25)] hover:shadow-[0_6px_16px_rgba(232,56,13,0.35)]
                transition-all duration-300 border border-white/40"
            >
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-full" />
              <LogOut size={15} strokeWidth={2.5} className="relative z-10" />
              <span className="relative z-10">Logout</span>
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden hidden lg:flex items-center gap-2 px-6 py-2 rounded-full text-white text-[14px] font-semibold font-sans
              bg-gradient-to-r from-[#FF6B00] to-[#FF8A00]
              shadow-[0_4px_12px_rgba(255,107,0,0.25)] hover:shadow-[0_6px_16px_rgba(255,107,0,0.35)]
              transition-all duration-300 border border-white/40"
          >
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 to-transparent pointer-events-none rounded-t-full" />
            <User size={16} strokeWidth={2.5} className="relative z-10" />
            <span className="relative z-10">Login</span>
          </motion.button>
        )}

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full
            bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-[80px] left-4 right-4 bg-white/95 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.1)] rounded-2xl p-4 lg:hidden flex flex-col gap-2"
          >
            {links.map((link) => {
              const isAddBook = link.href === '/add-book';
              const isDashboard = link.href === '/dashboard';
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[15px] font-semibold transition-colors
                    ${isAddBook
                      ? 'bg-[#00b6be]/10 text-[#00b6be]'
                      : isDashboard
                        ? 'bg-[#1D4ED8]/10 text-[#1D4ED8]'
                        : 'hover:bg-neutral-50 text-neutral-700'
                    }`}
                >
                  {isAddBook && <BookPlus size={16} />}
                  {isDashboard && <BarChart2 size={16} />}
                  {link.label}
                </Link>
              );
            })}
            
            <div className="h-px bg-neutral-100 my-2" />
            
            {isLoggedIn ? (
              <button
                onClick={() => { handleLogout(); setMobileOpen(false); }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#2563EB] text-white text-[15px] font-bold shadow-[0_4px_12px_rgba(29,78,216,0.25)]"
              >
                <LogOut size={16} /> Logout
              </button>
            ) : (
              <button
                onClick={() => { navigate('/login'); setMobileOpen(false); }}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8A00] text-white text-[15px] font-bold shadow-[0_4px_12px_rgba(255,107,0,0.25)]"
              >
                <User size={16} /> Login
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}


