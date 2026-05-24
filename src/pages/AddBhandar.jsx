import { motion } from 'framer-motion';
import BhandarPageSelector from '../components/BhandarPageSelector';

export default function AddBhandar() {
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
        className="w-full h-[80vh] min-h-[600px] bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden"
      >
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLScnMxBE9RTTw_Nn7v6zh0nvQem0ZzHXULdrZHs_ffWZCG2XtA/viewform?embedded=true"
          style={{ height: '100%', width: '100%' }}
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
          title="Add Bhandar Form"
        >
          Loading…
        </iframe>
      </motion.div>
    </div>
  );
}
