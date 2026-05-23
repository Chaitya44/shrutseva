import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // premium UX delay
    const ok = await login(username, password);
    setLoading(false);
    if (ok) {
      navigate('/add-book');
    } else {
      setError('Invalid credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 relative overflow-hidden">
      
      {/* Decorative ambient neon color spots */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#1D4ED8]/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00b6be]/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Modern cyber grid backdrop decoration */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#1D4ED8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px] relative z-10"
      >
        {/* Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#1D4ED8]/4 via-white/95 to-[#00b6be]/4 backdrop-blur-3xl rounded-[28px] p-8 shadow-[0_24px_64px_rgba(10,37,64,0.06)] border border-white/60 hover:border-[#1D4ED8]/25 transition-colors duration-300 group">
          
          {/* Vertical left indicator accent strip */}
          <div className="absolute left-0 top-0 bottom-0 w-[4.5px] bg-gradient-to-b from-[#1D4ED8] via-[#00b6be] to-[#FF6B00]" />

          {/* Top gloss reflection */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none rounded-t-[28px]" />

          {/* Header */}
          <div className="relative z-10 flex flex-col items-center mb-6">
            <div className="flex items-center gap-2.5 mb-2 group-hover:scale-105 transition-transform duration-300">
              <img src={logo} alt="ShrutSeva" className="h-9 w-auto filter drop-shadow-sm" />
              <span className="text-[22px] font-heading font-black tracking-tight text-[#012c77]">
                Shrut<span className="text-[#FF6B00]">Seva</span>
              </span>
            </div>
            
            <h1 className="text-[19px] font-heading font-extrabold text-[#0A2540] mt-2">Admin Login</h1>
            <p className="text-[12.5px] text-neutral-500 mt-1 font-bold">Sign in to access the admin panel</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
            {/* Username */}
            <div className="group relative">
              <label className="block text-[9.5px] font-black tracking-widest text-neutral-500 uppercase mb-1.5 ml-1 transition-colors group-focus-within:text-[#FF6B00]">Username</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1D4ED8] group-focus-within:text-[#FF6B00] transition-colors">
                  <User size={16} strokeWidth={2.5} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-neutral-200 bg-white/95 text-[13px] text-neutral-800 placeholder:text-neutral-300 font-bold outline-none focus:border-[#FF6B00] focus:bg-white transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                />
                {/* Underline focus slider */}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] transition-all duration-300 group-focus-within:w-full rounded-b-xl" />
              </div>
            </div>

            {/* Password */}
            <div className="group relative">
              <label className="block text-[9.5px] font-black tracking-widest text-neutral-500 uppercase mb-1.5 ml-1 transition-colors group-focus-within:text-[#FF6B00]">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1D4ED8] group-focus-within:text-[#FF6B00] transition-colors">
                  <Lock size={16} strokeWidth={2.5} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-neutral-200 bg-white/95 text-[13px] text-neutral-800 placeholder:text-neutral-300 font-bold outline-none focus:border-[#FF6B00] focus:bg-white transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                />
                {/* Underline focus slider */}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] transition-all duration-300 group-focus-within:w-full rounded-b-xl" />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#FF6B00] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[12.5px] font-bold"
              >
                <AlertCircle size={15} strokeWidth={2.5} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ y: -1, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="relative overflow-hidden w-full py-3 rounded-full text-white text-[13.5px] font-black tracking-widest uppercase
                bg-gradient-to-r from-[#1D4ED8] to-[#00b6be]
                shadow-[0_8px_24px_rgba(29,78,216,0.25)]
                hover:shadow-[0_12px_32px_rgba(29,78,216,0.35)]
                disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 mt-2 cursor-pointer active:scale-95"
            >
              {/* Button gloss */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
              <span className="relative z-10">
                {loading ? 'Signing in…' : 'Sign In'}
              </span>
            </motion.button>
          </form>

          {/* Hint */}
          <div className="relative z-10 text-center mt-6 p-2 rounded-xl bg-neutral-100/50 border border-neutral-200/50">
            <p className="text-[11px] text-neutral-400 font-bold">
              Demo Credentials
            </p>
            <p className="text-[11.5px] text-[#0A2540] font-mono mt-0.5 font-bold">
              admin <span className="text-neutral-400">/</span> admin@123
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
