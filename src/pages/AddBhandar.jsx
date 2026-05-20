import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BhandarPageSelector from '../components/BhandarPageSelector';

function sanitize(str) { return String(str || '').replace(/<[^>]*>/g, '').trim(); }

const INITIAL_FORM = {
  bhandar_name: '',
  city: '',
  area: '',
  state: '',
  bhandar_code: '',
  contact_person: '',
  mobile: '',
};

export default function AddBhandar() {
  const { selectedBhandar } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const payload = Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, sanitize(v)])
      );
      const res = await fetch('/front/add_bhandar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (res.ok && (json.success || json.status === 'ok' || json.id)) {
        setSuccess(true);
        setForm(INITIAL_FORM);
      } else {
        setError(json.message || json.error || 'Something went wrong. Please try again.');
      }
    } catch(e) {
      console.error(e);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: 'Bhandar Name', name: 'bhandar_name', placeholder: 'e.g. Shree Gyan Bhandar' },
    { label: 'City', name: 'city', placeholder: 'e.g. Ahmedabad' },
    { label: 'Area', name: 'area', placeholder: 'e.g. Navrangpura' },
    { label: 'State', name: 'state', placeholder: 'e.g. Gujarat' },
    { label: 'Bhandar Code', name: 'bhandar_code', placeholder: 'e.g. GB001' },
    { label: 'Contact Person', name: 'contact_person', placeholder: 'Full name' },
    { label: 'Mobile', name: 'mobile', placeholder: '10-digit mobile number' },
  ];

  return (
    <div className="w-full max-w-[1400px] px-4 sm:px-6 mx-auto pb-8 pt-14 sm:pt-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-heading font-extrabold tracking-tight">
            <span className="text-[#012c77]">Add Gyan</span><span className="text-[#FF6B00]"> Bhandar</span>
          </h1>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">Register a new Gyan Bhandar branch</span>
        </div>
        <BhandarPageSelector />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-2xl bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm p-6 sm:p-8"
      >
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6 text-green-700 font-semibold text-[14px]"
            >
              <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
              Gyan Bhandar registered successfully!
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-red-700 font-semibold text-[14px]"
            >
              <AlertCircle size={18} className="text-red-500 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {fields.map(({ label, name, placeholder }) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-neutral-600 uppercase tracking-wide">{label}</label>
              <input
                type="text"
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="border border-neutral-200 focus:border-[#012c77] rounded-xl px-4 py-2.5 text-[14px] outline-none bg-white transition-colors"
              />
            </div>
          ))}
          <div className="sm:col-span-2 flex justify-end pt-2">
            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#012c77] to-[#1D4ED8] text-white rounded-xl font-bold text-[14px] shadow-md cursor-pointer disabled:opacity-60 transition-opacity"
            >
              <PlusCircle size={16} />
              {loading ? 'Registering...' : 'Register Bhandar'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
