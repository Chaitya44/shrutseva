import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, Search, BarChart2, Building2, BookOpen, BookMarked, FileEdit,
  Download, Trash2, AlertCircle, History, Users, BookPlus, PlusCircle,
  LogOut, ChevronDown, ChevronRight, Menu, X, MapPin, Check,
  FilePlus2, PackageX, FileSearch, BookCopy, ClipboardList, Tag
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const BOOKS_LINKS = [
  { label: 'View',   href: '/books/view',   icon: BookOpen },
  { label: 'Add',    href: '/add-book',      icon: BookPlus },
  { label: 'Edit',   href: '/books/edit',    icon: FileEdit },
  { label: 'Export', href: '/books/export',  icon: Download },
];

const REPORTS_LINKS = [
  { label: 'Deleted Books',             href: '/reports/deleted',         icon: Trash2 },
  { label: 'Issued Books',              href: '/reports/issued',          icon: BookMarked },
  { label: 'All Outstanding Books',     href: '/reports/outstanding',     icon: AlertCircle },
  { label: 'Book History',              href: '/reports/book-history',    icon: History },
  { label: 'Member History',            href: '/reports/member-history',  icon: Users },
  { label: 'Book Issue History Search', href: '/reports/history-search',  icon: FileSearch },
  { label: 'Subjects',                  href: '/reports/subjects',        icon: Tag },
  { label: 'Missing Books',             href: '/reports/missing',         icon: PackageX },
  { label: 'Created Books',             href: '/reports/created',         icon: FilePlus2 },
  { label: 'Modified Books',            href: '/reports/modified',        icon: FileEdit },
];

const TOP_LINKS = [
  { label: 'Home',            href: '/',               icon: Home },
  { label: 'Quick Search',    href: '/quick-search',   icon: Search },
  { label: 'Advanced Search', href: '/advance-search', icon: Search },
  { label: 'Dashboard',       href: '/dashboard',      icon: BarChart2 },
  { label: 'Bhandars',        href: '/bhandars',       icon: Building2 },
];

const BOTTOM_LINKS = [
  { label: 'Members',         href: '/members',        icon: Users },
  { label: 'Add Gyan Bhandar',href: '/add-bhandar',   icon: PlusCircle },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const [booksExpanded, setBooksExpanded] = useState(false);
  const [reportsExpanded, setReportsExpanded] = useState(false);
  const [bhandarDropOpen, setBhandarDropOpen] = useState(false);
  const { isLoggedIn, logout, selectedBhandar, setSelectedBhandar, bhandarList } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const bhandarRef = useRef(null);

  // Auto-expand section if current route is inside it
  useEffect(() => {
    if (location.pathname.startsWith('/books')) setBooksExpanded(true);
    if (location.pathname.startsWith('/reports')) setReportsExpanded(true);
  }, [location.pathname]);

  // Close sidebar on route change (mobile)
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Close bhandar dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (bhandarRef.current && !bhandarRef.current.contains(e.target)) {
        setBhandarDropOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isLoggedIn) return null;

  const isActive = (href) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  const linkClass = (href) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 cursor-pointer select-none ${
      isActive(href)
        ? 'bg-[#FF6B00]/10 text-[#FF6B00] border-l-[3px] border-[#FF6B00] pl-[9px]'
        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
    }`;

  const subLinkClass = (href) =>
    `flex items-center gap-2.5 pl-7 pr-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 cursor-pointer select-none ${
      isActive(href)
        ? 'text-[#FF6B00] bg-[#FF6B00]/8 font-bold'
        : 'text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50'
    }`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-neutral-100 shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="ShrutSeva" className="h-8 w-auto" />
          <span className="text-[18px] font-heading font-extrabold text-[#012c77]">
            Shrut<span className="text-[#FF6B00]">Seva</span>
          </span>
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Bhandar Selector */}
      <div className="px-3 pt-3 pb-2 shrink-0" ref={bhandarRef}>
        <button
          onClick={() => setBhandarDropOpen(!bhandarDropOpen)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white border border-neutral-200 hover:border-[#012c77] rounded-xl text-[12px] font-bold text-[#012c77] transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <MapPin size={13} className="text-[#012c77] shrink-0" />
            <span className="truncate">{selectedBhandar || 'Select Bhandar'}</span>
          </div>
          <ChevronDown size={13} className={`shrink-0 transition-transform ${bhandarDropOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {bhandarDropOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -6, scaleY: 0.95 }}
              transition={{ duration: 0.15 }}
              className="mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-50"
            >
              {bhandarList.map((b) => (
                <button
                  key={b.value}
                  onClick={() => { setSelectedBhandar(b.value); setBhandarDropOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-[12px] font-semibold text-left transition-colors cursor-pointer ${
                    selectedBhandar === b.value ? 'bg-[#012c77]/8 text-[#012c77]' : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span className="truncate">{b.label}</span>
                  {selectedBhandar === b.value && <Check size={12} strokeWidth={3} />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-px bg-neutral-100 mx-3 my-1 shrink-0" />

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto">

        {/* Top links */}
        {TOP_LINKS.map(({ label, href, icon: Icon }) => (
          <Link key={href} to={href} className={linkClass(href)}>
            <Icon size={15} strokeWidth={2} className="shrink-0" />
            <span>{label}</span>
          </Link>
        ))}

        {/* Books expandable */}
        <div>
          <button
            onClick={() => setBooksExpanded(!booksExpanded)}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
              location.pathname.startsWith('/books') || location.pathname === '/add-book'
                ? 'bg-[#FF6B00]/10 text-[#FF6B00]'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <BookCopy size={15} strokeWidth={2} className="shrink-0" />
              <span>Books</span>
            </div>
            <motion.div animate={{ rotate: booksExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {booksExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-0.5 pt-1 pb-1">
                  {BOOKS_LINKS.map(({ label, href, icon: Icon }) => (
                    <Link key={href} to={href} className={subLinkClass(href)}>
                      <Icon size={13} strokeWidth={2} className="shrink-0" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Reports expandable */}
        <div>
          <button
            onClick={() => setReportsExpanded(!reportsExpanded)}
            className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 cursor-pointer ${
              location.pathname.startsWith('/reports')
                ? 'bg-[#012c77]/10 text-[#012c77]'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <ClipboardList size={15} strokeWidth={2} className="shrink-0" />
              <span>Reports</span>
            </div>
            <motion.div animate={{ rotate: reportsExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={14} />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {reportsExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-0.5 pt-1 pb-1">
                  {REPORTS_LINKS.map(({ label, href, icon: Icon }) => (
                    <Link key={href} to={href} className={subLinkClass(href)}>
                      <Icon size={13} strokeWidth={2} className="shrink-0" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom links */}
        {BOTTOM_LINKS.map(({ label, href, icon: Icon }) => (
          <Link key={href} to={href} className={linkClass(href)}>
            <Icon size={15} strokeWidth={2} className="shrink-0" />
            <span>{label}</span>
          </Link>
        ))}

        <div className="h-px bg-neutral-100 my-1" />

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-semibold text-red-500 hover:bg-red-50 hover:text-red-700 transition-all duration-200 cursor-pointer"
        >
          <LogOut size={15} strokeWidth={2} className="shrink-0" />
          <span>Logout</span>
        </button>

      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-neutral-100 shrink-0">
        <p className="text-[10px] text-neutral-400 font-medium">ShrutSeva Admin Panel</p>
        <p className="text-[9px] text-neutral-300">© 2025 All rights reserved</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Floating toggle button — only shown when sidebar is closed */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-2xl bg-gradient-to-br from-[#012c77] to-[#1D4ED8] text-white shadow-[0_8px_24px_rgba(1,44,119,0.35)] flex items-center justify-center hover:shadow-[0_12px_32px_rgba(1,44,119,0.45)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            aria-label="Open admin menu"
          >
            <Menu size={20} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Backdrop overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Slide-out drawer */}
      <AnimatePresence>
        {open && (
          <motion.aside
            ref={sidebarRef}
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 left-0 bottom-0 w-[260px] z-50 bg-white/95 backdrop-blur-xl border-r border-neutral-150 shadow-[4px_0_24px_rgba(0,0,0,0.08)] flex flex-col"
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
