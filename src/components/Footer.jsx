import { motion } from 'framer-motion';
import tyagLogo from '../assets/tyag-trust-logo.png';

const GOOGLE_PLAY_BADGE = 'https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full bg-white/70 backdrop-blur-sm border-t border-neutral-100 py-2.5 mt-auto"
    >
      <div className="w-full max-w-[1240px] px-6 sm:px-8 mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">

        {/* Left - Tyag Trust */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center p-1 shadow-sm">
            <img src={tyagLogo} alt="Tyag Trust" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[12px] text-neutral-600 font-medium">Powered by</span>
            <span className="text-[13px] text-[#FF6B00] font-bold">Tyag Trust</span>
          </div>
        </div>

        {/* Center Divider */}
        <div className="hidden sm:block w-px h-5 bg-neutral-200" />

        {/* Right - Copyright + Badge */}
        <div className="flex items-center gap-4">
          <p className="hidden md:block text-[12px] text-neutral-500 font-medium">
            © {new Date().getFullYear()} <span className="text-[#012c77] font-bold">Shrut</span><span className="text-[#FF6B00] font-bold">Seva</span>. All rights reserved.
          </p>
          <motion.a
            href="https://play.google.com/store/apps/details?id=com.shrutseva&hl=en_IN"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="shrink-0 opacity-90 hover:opacity-100 transition-opacity"
            aria-label="Get it on Google Play"
          >
            <img src={GOOGLE_PLAY_BADGE} alt="Get it on Google Play" className="h-[28px] w-auto object-contain" />
          </motion.a>
        </div>

      </div>
    </motion.footer>
  );
}

