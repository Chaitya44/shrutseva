import { motion } from 'framer-motion';
import { BookOpen, Users, Heart, Globe, Award, Sparkles } from 'lucide-react';
import logo from '../assets/logo.png';
import tyagLogo from '../assets/tyag-trust-logo.png';

const stats = [
  { label: 'Books Catalogued', value: '4,800+', icon: BookOpen, color: '#1D4ED8' },
  { label: 'Cities Covered',   value: '50+',    icon: Globe,    color: '#00b6be' },
  { label: 'Languages',        value: '3',      icon: Sparkles, color: '#FF6B00' },
  { label: 'Years of Service', value: '10+',    icon: Award,    color: '#00838F' },
];

const values = [
  {
    icon: BookOpen,
    title: 'Preservation',
    desc: 'Safeguarding thousands of rare Jain scriptures and literature for future generations through careful digital cataloguing.',
    color: '#1D4ED8',
    bg: 'from-[#EFF6FF] to-[#DBEAFE]',
  },
  {
    icon: Users,
    title: 'Community',
    desc: 'Serving scholars, students, and spiritual seekers across India with accessible, easy-to-search repositories.',
    color: '#00b6be',
    bg: 'from-[#ECFEFF] to-[#CFFAFE]',
  },
  {
    icon: Heart,
    title: 'Seva',
    desc: 'Built on the spirit of selfless service — ShrutSeva means "service to scripture," reflecting our core purpose.',
    color: '#FF6B00',
    bg: 'from-[#FFF7ED] to-[#FFEDD5]',
  },
];

export default function AboutUs() {
  return (
    <div className="w-full max-w-[1100px] px-6 sm:px-8 mx-auto pb-6 pt-14 sm:pt-16 overflow-y-auto">

      {/* ── Hero Section ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden bg-white/85 backdrop-blur-2xl rounded-[28px] p-8 sm:p-10 border border-white shadow-[0_20px_60px_rgba(10,37,64,0.07)] mb-6 flex flex-col lg:flex-row items-center gap-8"
      >
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-white/70 to-transparent pointer-events-none rounded-t-[28px]" />

        {/* Logo */}
        <div className="flex-shrink-0 relative z-10 flex flex-col items-center gap-3">
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-[#EFF6FF] to-[#DBEAFE] border border-white/60 flex items-center justify-center shadow-[0_12px_32px_rgba(29,78,216,0.12)]">
            <img src={logo} alt="ShrutSeva" className="w-28 h-28 object-contain" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[22px] font-heading font-extrabold text-[#012c77]">Shrut</span>
            <span className="text-[22px] font-heading font-extrabold text-[#FF6B00]">Seva</span>
          </div>
        </div>

        {/* Text */}
        <div className="relative z-10 flex-1 text-center lg:text-left">
          <h1 className="text-[28px] sm:text-[34px] font-heading font-extrabold text-[#0A2540] tracking-tight mb-3">
            About <span className="text-[#012c77]">Shrut</span><span className="text-[#FF6B00]">Seva</span>
          </h1>
          <p className="text-[15px] sm:text-[16px] text-neutral-600 leading-relaxed font-medium mb-4">
            ShrutSeva is a comprehensive digital repository of Jain Gyanbhandars — sacred libraries housing rare scriptures, literature, and knowledge texts. Our mission is to make this invaluable collection accessible to scholars, seekers, and communities worldwide.
          </p>
          <p className="text-[14px] sm:text-[15px] text-neutral-500 leading-relaxed font-medium">
            The platform enables users to search thousands of books across multiple Jain libraries by title, author, publisher, language, and subject — bridging ancient wisdom with modern technology.
          </p>
        </div>
      </motion.div>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-5 border border-white shadow-[0_8px_24px_rgba(10,37,64,0.05)] text-center"
          >
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent pointer-events-none rounded-t-2xl" />
            <div className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `${stat.color}18` }}>
              <stat.icon size={20} strokeWidth={2.5} style={{ color: stat.color }} />
            </div>
            <p className="text-[26px] font-heading font-extrabold tracking-tight" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-[12px] text-neutral-500 font-semibold mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Values ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {values.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
            className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${v.bg} border border-white shadow-[0_8px_24px_rgba(10,37,64,0.05)]`}
          >
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent pointer-events-none rounded-t-2xl" />
            <div className="relative z-10 w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${v.color}18` }}>
              <v.icon size={22} strokeWidth={2.5} style={{ color: v.color }} />
            </div>
            <h3 className="text-[17px] font-heading font-bold text-[#0A2540] mb-2">{v.title}</h3>
            <p className="text-[13px] text-neutral-600 leading-relaxed font-medium">{v.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Tyag Trust ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="relative overflow-hidden bg-white/85 backdrop-blur-2xl rounded-2xl p-6 border border-white shadow-[0_8px_24px_rgba(10,37,64,0.05)] flex flex-col sm:flex-row items-center text-center sm:text-left gap-5"
      >
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/70 to-transparent pointer-events-none rounded-t-2xl" />
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center p-2 shadow-sm flex-shrink-0">
          <img src={tyagLogo} alt="Tyag Trust" className="w-full h-full object-contain" />
        </div>
        <div className="relative z-10">
          <p className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase mb-1">An Initiative By</p>
          <h3 className="text-[20px] font-heading font-extrabold text-[#0A2540] mb-1">Tyag Trust</h3>
          <p className="text-[13px] text-neutral-500 font-medium">A non-profit organization dedicated to the preservation and propagation of Jain heritage, culture, and spiritual knowledge.</p>
        </div>
      </motion.div>

    </div>
  );
}
