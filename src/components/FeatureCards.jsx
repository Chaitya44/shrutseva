import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, FileSearch, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Gloss is baked into the gradient itself — top-left starts very light,
// transitions to a mid-tone, then deepens at the bottom-right.
const cardsData = [
  {
    title: 'Quick Search',
    description: 'Quickly search books by title and kruti',
    Icon: Search,
    // Top-left: near-white sky blue → mid royal blue → deep blue bottom-right
    gradient: `
      radial-gradient(circle at 0% 0%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.15) 35%, transparent 65%),
      linear-gradient(
        160deg,
        #a8c8ff 0%,
        #6fa8ff 18%,
        #3b82f6 36%,
        #2563EB 55%,
        #1D4ED8 75%,
        #1e40af 100%
      )
    `,
    shadow: '0 12px 28px -8px rgba(37, 99, 235, 0.50)',
    hoverShadow: '0 20px 40px -10px rgba(37, 99, 235, 0.70)',
    iconColor: '#1D4ED8',
    path: '/quick-search',
  },
  {
    title: 'Advance Search',
    description: 'Search books by name, author, publisher, language, topic etc.',
    Icon: SlidersHorizontal,
    // Top-left: pale yellow-orange → warm orange → deep burnt orange
    gradient: `
      radial-gradient(circle at 0% 0%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.15) 35%, transparent 65%),
      linear-gradient(
        160deg,
        #ffe0a0 0%,
        #ffb347 18%,
        #ff8c00 36%,
        #FF8A00 55%,
        #e65100 75%,
        #bf3c00 100%
      )
    `,
    shadow: '0 12px 28px -8px rgba(249, 115, 22, 0.50)',
    hoverShadow: '0 20px 40px -10px rgba(249, 115, 22, 0.70)',
    iconColor: '#E65100',
    path: '/advance-search',
  },
  {
    title: 'Search Book Index',
    description: 'Search book index via topics and index strings',
    Icon: FileSearch,
    // Top-left: pale mint → bright teal → deep teal
    gradient: `
      radial-gradient(circle at 0% 0%, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.15) 35%, transparent 65%),
      linear-gradient(
        160deg,
        #a0eaf0 0%,
        #4dd9e8 18%,
        #00bcd4 36%,
        #00ACC1 55%,
        #00838F 75%,
        #005f6b 100%
      )
    `,
    shadow: '0 12px 28px -8px rgba(0, 172, 193, 0.50)',
    hoverShadow: '0 20px 40px -10px rgba(0, 172, 193, 0.70)',
    iconColor: '#00838F',
    path: '/advance-search',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function FeatureCards() {
  const navigate = useNavigate();
  return (
    <section className="relative pt-6 sm:pt-10 lg:pt-0 lg:pb-4 pb-16 px-6 sm:px-8" id="features">
      <div className="w-full max-w-[1240px] mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
        >
          {cardsData.map((card) => (
            <FeatureCard key={card.title} {...card} navigate={navigate} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeatureCard({ title, description, Icon, gradient, shadow, hoverShadow, iconColor, path, navigate }) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5, scale: 1.012 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(path)}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="relative overflow-hidden rounded-[22px] cursor-pointer group flex items-center p-5 sm:p-6 min-h-[155px]"
      style={{ background: gradient, boxShadow: `inset 1px 1px 2px rgba(255,255,255,0.4), inset -1px -1px 2px rgba(0,0,0,0.1), ${shadow}` }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `inset 1px 1px 2px rgba(255,255,255,0.4), inset -1px -1px 2px rgba(0,0,0,0.1), ${hoverShadow}`; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = `inset 1px 1px 2px rgba(255,255,255,0.4), inset -1px -1px 2px rgba(0,0,0,0.1), ${shadow}`; }}
    >



      {/* Dot matrix texture */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(white 1.5px, transparent 1.5px)', backgroundSize: '14px 14px' }}
      />

      {/* Giant watermark icon */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.12] pointer-events-none text-white transform rotate-[-12deg]">
        <Icon size={130} strokeWidth={1.5} />
      </div>

      {/* Card Content */}
      <div className="relative z-10 flex items-center gap-4 sm:gap-5 w-full pr-10">
        {/* Glowing Icon Badge */}
        <div className="flex-shrink-0 relative">
          <div className="absolute -inset-2 rounded-full bg-white opacity-35 blur-md" />
          <div className="relative w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-[0_6px_16px_rgba(0,0,0,0.15)] border border-white/80">
            <Icon size={26} strokeWidth={3} style={{ color: iconColor }} />
          </div>
        </div>

        {/* Title + Description */}
        <div className="flex flex-col">
          <h3 className="text-[19px] sm:text-[21px] font-bold text-white tracking-tight leading-none mb-1.5 drop-shadow-sm">
            {title}
          </h3>
          <div className="w-8 h-[2px] bg-white/50 mb-2 rounded-full" />
          <p className="text-white/90 text-[12px] sm:text-[13px] leading-snug font-medium max-w-[200px]">
            {description}
          </p>
        </div>
      </div>

      {/* Arrow Pill */}
      <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.15)] group-hover:scale-110 transition-transform duration-300 z-10">
        <ArrowRight size={17} strokeWidth={3} style={{ color: iconColor }} />
      </div>
    </motion.div>
  );
}
