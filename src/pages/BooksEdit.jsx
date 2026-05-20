import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileEdit, Search, Save, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BhandarPageSelector from '../components/BhandarPageSelector';
import { sanitize, buildSafeQuery } from '../utils/security';

export default function BooksEdit() {
  const { selectedBhandar } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!query.trim()) { setBooks([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const params = buildSafeQuery({ client_side: 'true', city: 'all', title: query });
        const res = await fetch(`/front/quick_advance_book_search?${params}`);
        const json = await res.json();
        if (json && json.data) setBooks(json.data);
      } catch(e) { console.error(e); }
      finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(t);
  }, [query]);

  const startEdit = (book) => {
    setEditingId(book.master_ssid);
    setEditForm({
      book_name: book.book_name || '',
      author: book.author || '',
      publisher: book.publisher || '',
      lang_name: book.lang_name || '',
      part: book.part || '',
    });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/front/update_book/${editingId}`, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: JSON.stringify({
          book_name: sanitize(editForm.book_name),
          author: sanitize(editForm.author),
          publisher: sanitize(editForm.publisher),
          lang_name: sanitize(editForm.lang_name),
          part: sanitize(editForm.part),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setBooks(prev => prev.map(b =>
          b.master_ssid === editingId ? { ...b, ...editForm } : b
        ));
        setTimeout(() => { setEditingId(null); setSaved(false); }, 1500);
      }
    } catch(e) { console.error(e); }
    finally { setSaving(false); }
  };

  return (
    <div className="w-full max-w-[1400px] px-4 sm:px-6 mx-auto pb-8 pt-14 sm:pt-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-heading font-extrabold tracking-tight">
            <span className="text-[#012c77]">Edit</span><span className="text-[#FF6B00]"> Books</span>
          </h1>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">Search and edit catalog entries</span>
        </div>
        <BhandarPageSelector />
      </div>

      <div className="relative mb-6 max-w-lg">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by book title..."
          className="w-full border border-neutral-200 focus:border-[#012c77] rounded-xl pl-10 pr-4 py-3 text-[14px] outline-none bg-white/80 backdrop-blur"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-4 border-[#012c77] border-t-transparent rounded-full animate-spin"/></div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
          <FileEdit size={40} className="mb-3 opacity-30"/>
          <p className="font-semibold">{query ? 'No books found' : 'Search to find books'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {books.map((book, i) => (
            <motion.div key={book.master_ssid || i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="bg-white/85 backdrop-blur border border-white/60 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-neutral-800 truncate">{book.book_name || '-'}</p>
                  <p className="text-[11px] text-neutral-400 font-medium truncate">{book.author || '-'} · {book.lang_name || '-'}</p>
                </div>
                <button onClick={() => editingId === book.master_ssid ? setEditingId(null) : startEdit(book)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${editingId === book.master_ssid ? 'bg-neutral-100 text-neutral-600' : 'bg-[#012c77]/10 text-[#012c77] hover:bg-[#012c77]/20'}`}>
                  {editingId === book.master_ssid ? <><X size={13}/> Cancel</> : <><FileEdit size={13}/> Edit</>}
                </button>
              </div>
              {editingId === book.master_ssid && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="px-5 pb-4 border-t border-neutral-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[{key:'book_name',label:'Book Name'},{key:'author',label:'Author'},{key:'publisher',label:'Publisher'},{key:'lang_name',label:'Language'},{key:'part',label:'Part'}].map(({key,label})=>(
                    <div key={key}>
                      <label className="block text-[11px] font-bold text-neutral-500 mb-1">{label}</label>
                      <input value={editForm[key]} onChange={e=>setEditForm(f=>({...f,[key]:e.target.value}))} className="w-full border border-neutral-200 focus:border-[#012c77] rounded-lg px-3 py-2 text-[13px] outline-none bg-white"/>
                    </div>
                  ))}
                  <div className="sm:col-span-2 flex justify-end">
                    <button onClick={handleSave} disabled={saving} className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-bold text-white transition-all cursor-pointer shadow-md ${saved ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#012c77] to-[#1D4ED8] hover:opacity-90'}`}>
                      <Save size={14}/>{saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
