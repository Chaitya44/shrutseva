import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

export default function Hero() {
  return (
    <section className="relative pt-0 pb-6 lg:pb-0" id="hero">
      <div className="relative w-full max-w-[1200px] px-6 sm:px-8 mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">

          {/* Left Side - Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 w-full max-w-[600px] lg:max-w-[560px] xl:max-w-[620px] text-center lg:text-left z-10 mt-6 sm:mt-0"
          >
            <h1 className="text-[32px] sm:text-[48px] lg:text-[52px] xl:text-[58px] font-heading font-extrabold leading-[1.08] tracking-tight">
              <span className="text-[#012c77] block pb-1.5 drop-shadow-sm">Jain Gyanbhandar&#8217;s</span>
              <span className="bg-gradient-to-r from-[#FF6B00] to-[#FF9F1C] bg-clip-text text-transparent block pb-1">
                Book Repository
              </span>
            </h1>
          </motion.div>

          {/* Right Side - Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex-shrink-0 relative flex items-center justify-center w-[220px] h-[220px] sm:w-[320px] sm:h-[320px] lg:w-[380px] lg:h-[380px] my-4 sm:my-0"
          >
            {/* Soft circular background with dark blue glow that breathes */}
            <motion.div
              animate={{ scale: [1, 1.03, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-gradient-to-br from-[#F8FAFC] to-[#DBEAFE] border border-white/60 shadow-[0_0_80px_rgba(29,78,216,0.35)]"
            />
            {/* Very faint inner ring */}
            <div className="absolute inset-4 rounded-full border border-blue-100/50 pointer-events-none" />

            {/* Tree Logo */}
            <motion.img
              src={logo}
              alt="ShrutSeva - Jain Book Repository"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-[180px] h-[180px] sm:w-[280px] sm:h-[280px] lg:w-[330px] lg:h-[330px] object-contain"
              style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.08))' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

