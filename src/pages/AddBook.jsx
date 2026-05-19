import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Hash, Type, BookMarked, User, Edit3, Globe, FileText,
  Calendar, Layers, Building2, Tag, StickyNote, Plus, RotateCcw,
  Info, BookPlus, Printer, Image, Database, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight
} from 'lucide-react';
import BhandarPageSelector from '../components/BhandarPageSelector';


// ── Master data (will be populated from API) ─────────────────────────────────
const MOCK_DATA = [
  {
    id: 'M001',
    size: 'A',
    num: 'B-1024',
    name: 'Kalpa Sutra',
    alt: 'Bhadrabahu Samhita',
    part: 'Vol 1',
    kruti: 'Scripture Copy',
    author: 'Acharya Bhadrabahu',
    editor: 'Muni Ramprasad',
    lang: 'G',
    page: '120',
    yearType: 'VS',
    year: '2020',
    edition: '2nd',
    publisher: 'Tyag Trust Press',
    subject: 'Scriptures',
    particular: 'Old Manuscript Copy'
  },
  {
    id: 'M002',
    size: 'B',
    num: 'B-2056',
    name: 'Tattvartha Sutra',
    alt: 'Jain Philosophy',
    part: 'Vol 2',
    kruti: 'Commentary Work',
    author: 'Acharya Umaswati',
    editor: 'Pandit Nathuram',
    lang: 'H',
    page: '240',
    yearType: 'AD',
    year: '2018',
    edition: '3rd',
    publisher: 'Jain Gyan Bhandar',
    subject: 'Philosophy',
    particular: 'Golden Lettering'
  },
  {
    id: 'M003',
    size: 'C',
    num: 'B-3091',
    name: 'Bhaktamara Stotra',
    alt: 'Devotional Hymns',
    part: 'Vol 1',
    kruti: 'Hymn Collection',
    author: 'Acharya Manatunga',
    editor: 'Shastri Jaydev',
    lang: 'E',
    page: '80',
    yearType: 'VS',
    year: '2022',
    edition: '1st',
    publisher: 'Divya Press',
    subject: 'Devotional',
    particular: 'Includes illustrations'
  }
];

const LANG_MAP = {
  'G': 'Gujarati',
  'H': 'Hindi',
  'E': 'English'
};


const LANG_COLOR = { E: '#2563EB', G: '#FF8A00', H: '#00b6be' };
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const FieldInput = ({ icon: Icon, label, placeholder, type = 'text', name, value, onChange }) => (
  <div className="border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 focus-within:border-neutral-300 focus-within:bg-white transition-all duration-300 rounded-xl px-3 py-1.5 flex flex-col justify-center group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.01)] relative overflow-hidden min-w-0">
    <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-focus-within:text-[#FF6B00] transition-colors">
      <Icon size={13} strokeWidth={2.5} className="shrink-0" />
      <label className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400 truncate">{label}</label>
    </div>
    <input 
      type={type} 
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder} 
      className="w-full text-[13px] text-neutral-800 font-bold outline-none bg-transparent placeholder:text-neutral-300 placeholder:font-medium animate-none" 
    />
    {/* Dynamic brand orange slide indicator */}
    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
  </div>
);

const SelectField = ({ icon: Icon, label, options, name, value, onChange }) => (
  <div className="border border-neutral-200/80 bg-neutral-50/50 backdrop-blur-md hover:bg-neutral-50 hover:border-neutral-300 focus-within:border-neutral-300 focus-within:bg-white transition-all duration-300 rounded-xl px-3 py-1.5 flex flex-col justify-center group shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_2px_4px_rgba(10,37,64,0.01)] relative overflow-hidden min-w-0">
    <div className="flex items-center gap-1.5 mb-0.5 text-[#0A2540]/60 group-focus-within:text-[#00b6be] transition-colors">
      <Icon size={13} strokeWidth={2.5} className="shrink-0" />
      <span className="text-[10px] font-bold uppercase tracking-wider leading-none text-neutral-400 truncate">{label}</span>
    </div>
    <div className="relative w-full flex items-center">
      <select 
        name={name}
        value={value}
        onChange={onChange}
        className="w-full text-[13px] text-neutral-800 font-bold outline-none bg-transparent appearance-none cursor-pointer pr-4"
      >
        {options.map(o => <option key={o} value={o === 'Select book size' || o === 'Select language' || o === 'Select type' || o === 'Select year' || o === 'Select edition' ? '' : o} className="bg-white text-neutral-800 font-medium">{o}</option>)}
      </select>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#0A2540]/60 group-focus-within:text-[#00b6be] transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
    </div>
    {/* Dynamic brand teal slide indicator */}
    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#00b6be] scale-x-0 group-focus-within:scale-x-100 transition-transform duration-300 origin-left" />
  </div>
);

const ActionBtn = ({ label, icon: Icon, color, onClick }) => {
  const styles = {
    blue:   'bg-gradient-to-r from-[#1D4ED8] to-[#1565FF] shadow-[0_6px_18px_rgba(29,78,216,0.25)] hover:shadow-[0_10px_26px_rgba(29,78,216,0.35)]',
    teal:   'bg-gradient-to-r from-[#00b6be] to-[#0099a8] shadow-[0_6px_18px_rgba(0,182,190,0.25)] hover:shadow-[0_10px_26px_rgba(0,182,190,0.35)]',
    orange: 'bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] shadow-[0_6px_18px_rgba(255,107,0,0.25)] hover:shadow-[0_10px_26px_rgba(255,107,0,0.35)]',
  }[color];
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-white text-[11px] font-black tracking-widest uppercase transition-all duration-300 cursor-pointer ${styles}`}
    >
      <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      <Icon size={14} strokeWidth={2.5} className="relative z-10" />
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
};

export default function AddBook() {
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState({
    size: '',
    num: '',
    name: '',
    part: '',
    author: '',
    editor: '',
    lang: '',
    pages: '',
    yearType: '',
    year: '',
    edition: '',
    publisher: '',
    subject: '',
    note: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setForm({
      size: '',
      num: '',
      name: '',
      part: '',
      author: '',
      editor: '',
      lang: '',
      pages: '',
      yearType: '',
      year: '',
      edition: '',
      publisher: '',
      subject: '',
      note: ''
    });
  };

  const handleAutofill = (row) => {
    setForm({
      size: row.size || '',
      num: row.num || '',
      name: row.name || '',
      part: row.part || '',
      author: row.author || '',
      editor: row.editor || '',
      lang: LANG_MAP[row.lang] || row.lang || '',
      pages: row.page || '',
      yearType: row.yearType || '',
      year: row.year || '',
      edition: row.edition || '',
      publisher: row.publisher || '',
      subject: row.subject || '',
      note: row.particular || ''
    });
  };

  const handleAddBookSubmit = (e) => {
    if (e) e.preventDefault();
    console.log("Submitting form data to backend:", form);
    alert(`Ready to submit metadata connection:\n${JSON.stringify(form, null, 2)}`);
  };

  const totalPages = Math.ceil(MOCK_DATA.length / pageSize);
  const paginatedData = MOCK_DATA.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full max-w-[1400px] px-4 sm:px-6 mx-auto pb-4 pt-14 sm:pt-16 overflow-y-auto">

      {/* ── Page Title ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-5">
        <h1 className="text-[28px] sm:text-[34px] font-heading font-extrabold tracking-tight mb-1">
          <span className="text-[#012c77]">Add</span>{' '}
          <span className="text-[#FF6B00]">Book Entry</span>
        </h1>
      </div>

      {/* ── Form Card ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden bg-white/85 backdrop-blur-2xl rounded-[24px] py-4 px-5 sm:py-5 sm:px-6 shadow-[0_20px_60px_rgba(10,37,64,0.06)] border border-white mb-5"
      >
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white via-white/40 to-transparent pointer-events-none rounded-t-[24px]" />

        {/* Unified Layout Input Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-5">
          <SelectField icon={Layers} label="Size" name="size" value={form.size} onChange={handleChange} options={['Select book size', 'A', 'B', 'C', 'D']} />
          <FieldInput icon={Hash} label="Number" name="num" value={form.num} onChange={handleChange} placeholder="Enter book number" />
          <div className="sm:col-span-2 md:col-span-1 xl:col-span-1">
            <FieldInput icon={Type} label="Name" name="name" value={form.name} onChange={handleChange} placeholder="Enter book name" />
          </div>
          <FieldInput icon={BookMarked} label="Book Part" name="part" value={form.part} onChange={handleChange} placeholder="Enter book part" />
          <FieldInput icon={User} label="Author" name="author" value={form.author} onChange={handleChange} placeholder="Enter author name" />
          <FieldInput icon={Edit3} label="Editor" name="editor" value={form.editor} onChange={handleChange} placeholder="Enter editor name" />
          <SelectField icon={Globe} label="Language" name="lang" value={form.lang} onChange={handleChange} options={['Select language', 'Hindi', 'Gujarati', 'English', 'Sanskrit']} />
          <FieldInput icon={FileText} label="Pages" name="pages" value={form.pages} onChange={handleChange} placeholder="No. of pages" type="number" />
          <SelectField icon={Calendar} label="Year Type" name="yearType" value={form.yearType} onChange={handleChange} options={['Select type', 'VS', 'AD', 'BS']} />
          <SelectField icon={Calendar} label="Year" name="year" value={form.year} onChange={handleChange} options={['Select year', ...Array.from({length:50},(_,i)=>`${2024-i}`)]} />
          <SelectField icon={BookOpen} label="Edition" name="edition" value={form.edition} onChange={handleChange} options={['Select edition', '1st', '2nd', '3rd', '4th', '5th']} />
          <FieldInput icon={Building2} label="Publisher" name="publisher" value={form.publisher} onChange={handleChange} placeholder="Enter publisher name" />
          <FieldInput icon={Tag} label="Subject" name="subject" value={form.subject} onChange={handleChange} placeholder="Enter subject" />
          <FieldInput icon={StickyNote} label="Bhandar Note" name="note" value={form.note} onChange={handleChange} placeholder="Enter bhandar note" />
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-wrap gap-3">
          <ActionBtn label="ADD BOOK"    icon={BookPlus}  color="blue"  onClick={handleAddBookSubmit} />
          <ActionBtn label="CLEAR"       icon={RotateCcw} color="teal"  onClick={handleClear} />
          <ActionBtn label="BOOK INFO"   icon={Info}      color="orange" />
          <ActionBtn label="ADD KRUTI"   icon={Plus}      color="blue"  />
          <ActionBtn label="PRESENT COPY" icon={Printer}  color="teal"  />
          <ActionBtn label="IMAGE"       icon={Image}     color="orange" />
        </div>
      </motion.div>

      {/* ── Master Data Table ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden bg-white/85 backdrop-blur-2xl rounded-[24px] shadow-[0_16px_48px_rgba(10,37,64,0.07)] border border-white"
      >
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/70 to-transparent pointer-events-none rounded-t-[24px]" />

        {/* Table header bar */}
        <div className="relative z-10 flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1D4ED8] to-[#00b6be] flex items-center justify-center">
              <Database size={14} strokeWidth={2.5} className="text-white" />
            </div>
            <h2 className="text-[15px] font-heading font-bold text-[#0A2540]">Master Data</h2>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-neutral-500 font-medium">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-neutral-200 rounded-lg px-2 py-1 text-[13px] text-neutral-700 font-semibold outline-none focus:border-[#00b6be] transition-all bg-white"
            >
              {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Scrollable table */}
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-gradient-to-r from-[#1D4ED8] to-[#00b6be] text-white">
                {['Master ID','Size','Name','Alternate Name','Part','Kruti','Author','Editor','Language','Page','Year','Edition','Publisher','Subject','Particular'].map(h => (
                  <th key={h} className="px-3 py-2.5 text-left font-bold whitespace-nowrap first:pl-5 last:pr-5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, i) => (
                <tr key={row.id} className={`border-b border-neutral-50 hover:bg-[#00b6be]/5 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}`}>
                  <td className="px-3 py-2.5 pl-5 font-bold whitespace-nowrap">
                    <button 
                      onClick={() => handleAutofill(row)}
                      className="px-2.5 py-1 rounded-lg text-white text-[11px] font-black tracking-wide bg-[#0090CB] hover:bg-[#007eb3] active:scale-95 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md"
                    >
                      {row.id}
                    </button>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#1D4ED8]/10 text-[#1D4ED8] text-[11px] font-bold">{row.size}</span>
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-neutral-800 max-w-[140px] truncate">{row.name}</td>
                  <td className="px-3 py-2.5 text-neutral-500">{row.alt}</td>
                  <td className="px-3 py-2.5 text-neutral-500">{row.part}</td>
                  <td className="px-3 py-2.5 text-neutral-500">{row.kruti}</td>
                  <td className="px-3 py-2.5 text-neutral-700 max-w-[120px] truncate">{row.author}</td>
                  <td className="px-3 py-2.5 text-neutral-500">{row.editor}</td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[10px] font-extrabold" style={{ background: LANG_COLOR[row.lang] || '#888' }}>
                      {row.lang}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-neutral-500">{row.page}</td>
                  <td className="px-3 py-2.5 text-neutral-500">{row.year}</td>
                  <td className="px-3 py-2.5 text-neutral-500">{row.edition}</td>
                  <td className="px-3 py-2.5 text-neutral-700 max-w-[130px] truncate">{row.publisher}</td>
                  <td className="px-3 py-2.5 text-neutral-500">{row.subject}</td>
                  <td className="px-3 py-2.5 pr-5 text-neutral-500">{row.particular}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-neutral-100 gap-3">
          <p className="text-[12.5px] text-neutral-500 font-medium">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, MOCK_DATA.length)} of {MOCK_DATA.length} entries
          </p>
          <div className="flex items-center gap-1.5">
            <PagBtn icon={ChevronsLeft}  onClick={() => setCurrentPage(1)}            disabled={currentPage === 1} />
            <PagBtn icon={ChevronLeft}   onClick={() => setCurrentPage(p => p - 1)}  disabled={currentPage === 1} />
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-[13px] font-bold transition-all ${currentPage === p ? 'bg-[#1D4ED8] text-white shadow-[0_4px_10px_rgba(29,78,216,0.35)]' : 'text-neutral-600 hover:bg-neutral-100'}`}>
                  {p}
                </button>
              );
            })}
            {totalPages > 5 && <span className="text-neutral-400 text-[13px] font-bold">…</span>}
            {totalPages > 5 && (
              <button onClick={() => setCurrentPage(totalPages)}
                className={`w-8 h-8 rounded-lg text-[13px] font-bold transition-all ${currentPage === totalPages ? 'bg-[#1D4ED8] text-white' : 'text-neutral-600 hover:bg-neutral-100'}`}>
                {totalPages}
              </button>
            )}
            <PagBtn icon={ChevronRight}  onClick={() => setCurrentPage(p => p + 1)}  disabled={currentPage === totalPages} />
            <PagBtn icon={ChevronsRight} onClick={() => setCurrentPage(totalPages)}  disabled={currentPage === totalPages} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function PagBtn({ icon: Icon, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-8 h-8 rounded-lg text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all">
      <Icon size={14} strokeWidth={2.5} />
    </button>
  );
}
