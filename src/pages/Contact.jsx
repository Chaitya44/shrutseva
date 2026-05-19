import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send, User, MessageSquare, CheckCircle, Clock, Globe, ArrowUpRight } from 'lucide-react';

const INFO_ITEMS = [
  {
    icon: MapPin,
    label: 'Address',
    value: 'Tyag Trust, Jain Gyanbhandar, Gujarat, India',
    color: '#1D4ED8',
    gradient: 'from-[#1D4ED8] to-[#1565FF]',
    bgStyle: 'from-[#1D4ED8]/5 to-[#1565FF]/5',
    hoverBg: 'hover:from-[#1D4ED8]/10 hover:to-[#1565FF]/10',
    borderStyle: 'border-[#1D4ED8]/20 group-hover:border-[#1D4ED8]/40'
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'info@shrutseva.org',
    color: '#00b6be',
    gradient: 'from-[#00b6be] to-[#0099a8]',
    bgStyle: 'from-[#00b6be]/5 to-[#0099a8]/5',
    hoverBg: 'hover:from-[#00b6be]/10 hover:to-[#0099a8]/10',
    borderStyle: 'border-[#00b6be]/20 group-hover:border-[#00b6be]/40'
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 98765 43210',
    color: '#FF6B00',
    gradient: 'from-[#FF6B00] to-[#FF9F1C]',
    bgStyle: 'from-[#FF6B00]/5 to-[#FF9F1C]/5',
    hoverBg: 'hover:from-[#FF6B00]/10 hover:to-[#FF9F1C]/10',
    borderStyle: 'border-[#FF6B00]/20 group-hover:border-[#FF6B00]/40'
  },
  {
    icon: Clock,
    label: 'Hours',
    value: 'Mon – Sat: 9 AM – 6 PM IST',
    color: '#4F46E5',
    gradient: 'from-[#4F46E5] to-[#7C3AED]',
    bgStyle: 'from-[#4F46E5]/5 to-[#7C3AED]/5',
    hoverBg: 'hover:from-[#4F46E5]/10 hover:to-[#7C3AED]/10',
    borderStyle: 'border-[#4F46E5]/20 group-hover:border-[#4F46E5]/40'
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="w-full max-w-[1100px] px-6 sm:px-8 mx-auto pb-4 pt-14 sm:pt-16 overflow-y-auto relative">
      
      {/* Decorative ambient color spots */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-[#1565FF]/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-[#00b6be]/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="mb-6 relative z-10"
      >
        <h1 className="text-[28px] sm:text-[34px] font-heading font-extrabold tracking-tight">
          <span className="text-[#012c77]">Get in </span>
          <span className="text-[#FF6B00]">Touch</span>
        </h1>
        <p className="text-[14px] text-neutral-500 font-bold mt-1">
          Have a question or feedback? We would love to hear from you.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10">

        {/* ── Left Column (Info Card + Map) ─────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden bg-gradient-to-br from-[#1D4ED8]/3 via-white/95 to-[#00b6be]/3 backdrop-blur-3xl rounded-[24px] p-6 border border-white/60 shadow-[0_20px_60px_rgba(10,37,64,0.05)] flex-1 flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/70 to-transparent pointer-events-none rounded-t-[24px]" />
            
            <div className="relative z-10 space-y-5">
              <div className="border-b border-neutral-100 pb-3">
                <h2 className="text-[17px] font-heading font-extrabold text-[#0A2540]">Contact Details</h2>
              </div>

              <div className="space-y-4">
                {INFO_ITEMS.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-4 group cursor-pointer">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 group-hover:rotate-2 transition-all duration-300`}>
                        <Icon size={18} strokeWidth={2.5} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-black tracking-widest text-neutral-400 uppercase mb-0.5">{item.label}</p>
                        <p className="text-[13.5px] font-extrabold text-[#0A2540] group-hover:text-[#FF6B00] transition-colors duration-200">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Cyberpunk Tech Map Placeholder */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative overflow-hidden rounded-[24px] h-[135px] flex items-center justify-center border border-slate-800 shadow-lg group cursor-pointer hover:shadow-[0_16px_40px_rgba(15,23,42,0.3)] transition-all duration-300 shrink-0"
          >
            {/* Tech/Compass Grid Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-[24px]" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:14px_14px]" />
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <div className="w-20 h-20 rounded-full border border-sky-400 animate-pulse" />
              <div className="w-36 h-36 rounded-full border border-sky-400 absolute animate-ping" style={{ animationDuration: '4s' }} />
            </div>

            {/* Glowing Locator Pin */}
            <div className="relative z-10 flex flex-col items-center gap-1.5 text-center px-4">
              <div className="relative flex items-center justify-center w-8 h-8">
                <span className="absolute inline-flex h-6 w-6 rounded-full bg-[#FF6B00]/40 animate-ping" />
                <span className="absolute inline-flex h-4 w-4 rounded-full bg-[#FF6B00]/60" />
                <Globe size={16} className="relative z-10 text-white animate-spin" style={{ animationDuration: '10s' }} />
              </div>
              <div>
                <span className="text-[12px] font-black tracking-widest text-[#00b6be] uppercase block">Gujarat, India</span>
                <span className="text-[10px] font-bold text-neutral-400 mt-0.5 block">Tyag Trust Jain Gyanbhandar Network</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Contact Form (right) ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="lg:col-span-3 relative overflow-hidden bg-gradient-to-br from-[#1D4ED8]/3 via-white/95 to-[#00b6be]/3 backdrop-blur-3xl rounded-[24px] p-6 border border-white/60 shadow-[0_20px_60px_rgba(10,37,64,0.05)]"
        >
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/70 to-transparent pointer-events-none rounded-t-[24px]" />

          {submitted ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 flex flex-col items-center justify-center h-full py-12 text-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00b6be] to-[#0099a8] flex items-center justify-center shadow-lg shadow-[#00b6be]/20 animate-bounce">
                <CheckCircle size={32} className="text-white" />
              </div>
              <h3 className="text-[20px] font-heading font-black text-[#0A2540]">Message Sent!</h3>
              <p className="text-[13px] text-neutral-500 font-bold max-w-[280px] leading-relaxed">Thank you for reaching out. We will get back to you within 24–48 hours.</p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                className="mt-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#1D4ED8] to-[#1565FF] text-white text-[12px] font-black hover:shadow-lg hover:shadow-[#1D4ED8]/25 transition-all duration-300"
              >
                Send Another
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-2">
                <h2 className="text-[17px] font-heading font-extrabold text-[#0A2540]">Send a Message</h2>
                <span className="text-[9px] font-black text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-0.5 rounded border border-[#FF6B00]/20 uppercase tracking-widest animate-pulse">Contact Console</span>
              </div>

              {/* Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name field */}
                <div className="group relative">
                  <label className="block text-[9.5px] font-black tracking-widest text-neutral-500 uppercase mb-1.5 transition-colors group-focus-within:text-[#FF6B00]">Your Name</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1D4ED8] group-focus-within:text-[#FF6B00] transition-colors"><User size={14} strokeWidth={2.5} /></div>
                    <input
                      name="name" value={form.name} onChange={handleChange} required
                      placeholder="Full name"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white/95 text-[13px] text-neutral-800 placeholder:text-neutral-300 font-bold outline-none focus:border-[#FF6B00] focus:bg-white transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                    />
                    {/* Focus expansion underline */}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] transition-all duration-300 group-focus-within:w-full rounded-b-xl" />
                  </div>
                </div>

                {/* Email field */}
                <div className="group relative">
                  <label className="block text-[9.5px] font-black tracking-widest text-neutral-500 uppercase mb-1.5 transition-colors group-focus-within:text-[#FF6B00]">Email Address</label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1D4ED8] group-focus-within:text-[#FF6B00] transition-colors"><Mail size={14} strokeWidth={2.5} /></div>
                    <input
                      name="email" value={form.email} onChange={handleChange} required type="email"
                      placeholder="your@email.com"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white/95 text-[13px] text-neutral-800 placeholder:text-neutral-300 font-bold outline-none focus:border-[#FF6B00] focus:bg-white transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                    />
                    {/* Focus expansion underline */}
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] transition-all duration-300 group-focus-within:w-full rounded-b-xl" />
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div className="group relative">
                <label className="block text-[9.5px] font-black tracking-widest text-neutral-500 uppercase mb-1.5 transition-colors group-focus-within:text-[#FF6B00]">Subject</label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1D4ED8] group-focus-within:text-[#FF6B00] transition-colors"><MessageSquare size={14} strokeWidth={2.5} /></div>
                  <input
                    name="subject" value={form.subject} onChange={handleChange} required
                    placeholder="What's this regarding?"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-white/95 text-[13px] text-neutral-800 placeholder:text-neutral-300 font-bold outline-none focus:border-[#FF6B00] focus:bg-white transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                  />
                  {/* Focus expansion underline */}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] transition-all duration-300 group-focus-within:w-full rounded-b-xl" />
                </div>
              </div>

              {/* Message */}
              <div className="group relative">
                <label className="block text-[9.5px] font-black tracking-widest text-neutral-500 uppercase mb-1.5 transition-colors group-focus-within:text-[#00b6be]">Message</label>
                <div className="relative">
                  <textarea
                    name="message" value={form.message} onChange={handleChange} required rows={3}
                    placeholder="Write your message here..."
                    className="w-full px-4 py-2.5 rounded-xl border border-neutral-200 bg-white/95 text-[13px] text-neutral-800 placeholder:text-neutral-300 font-bold outline-none focus:border-[#00b6be] focus:bg-white transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)] resize-none"
                  />
                  {/* Focus expansion underline - Teal for secondary inputs */}
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-gradient-to-r from-[#00b6be] to-[#0099a8] transition-all duration-300 group-focus-within:w-[calc(100%-8px)] rounded-b-xl" />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ y: -1, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="relative overflow-hidden w-full flex items-center justify-center gap-2 py-3 rounded-full text-white text-[13px] font-black tracking-widest uppercase
                  bg-gradient-to-r from-[#1D4ED8] to-[#1565FF]
                  shadow-[0_8px_24px_rgba(29,78,216,0.25)]
                  hover:shadow-[0_12px_32px_rgba(29,78,216,0.35)]
                  disabled:opacity-60 transition-all duration-300 cursor-pointer active:scale-95"
              >
                <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                <Send size={14} strokeWidth={2.5} className="relative z-10" />
                <span className="relative z-10">{loading ? 'Sending…' : 'Send Message'}</span>
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
