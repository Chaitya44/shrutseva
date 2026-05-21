import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, MapPin, Phone, Hash } from 'lucide-react';

export default function Bhandars() {
  const [bhandars, setBhandars] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/get_bhandars_list?userId=1&usertype=1&length=-1');
        const json = await res.json();
        if (active) {
          if (json && json.data) setBhandars(json.data);
          else if (Array.isArray(json)) setBhandars(json);
        }
      } catch(e) { console.error(e); }
      finally { if(active) setLoading(false); }
    }
    load();
    return () => { active = false; };
  }, []);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.07 } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <div className="w-full max-w-[1400px] px-4 sm:px-6 mx-auto pb-8 pt-14 sm:pt-16">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[28px] font-heading font-extrabold tracking-tight">
            <span className="text-[#012c77]">Gyan</span><span className="text-[#FF6B00]"> Bhandars</span>
          </h1>
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide">All registered Gyan Bhandar branches</span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-[#012c77] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : bhandars.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
          <Building2 size={40} className="mb-3 opacity-30" />
          <p className="font-semibold">No Bhandars found</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {bhandars.map((b, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(1,44,119,0.13)' }}
              className="bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-sm p-5 flex flex-col gap-3 transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#012c77] to-[#1D4ED8] flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-white" />
                  </div>
                  <h2 className="font-heading font-extrabold text-[15px] text-[#012c77] leading-tight">
                    {b.sname || b.bhandar_name || 'Unnamed Bhandar'}
                  </h2>
                </div>
                {(b.bhandar_code || b.code) && (
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#012c77]/10 text-[#012c77] text-[11px] font-bold flex-shrink-0">
                    <Hash size={10} />
                    {b.bhandar_code || b.code}
                  </span>
                )}
              </div>

              <div className="h-px bg-neutral-100" />

              {/* Details */}
              <div className="flex flex-col gap-2">
                {(b.city || b.area || b.state) && (
                  <div className="flex items-start gap-2 text-[13px] text-neutral-600">
                    <MapPin size={14} className="text-[#FF6B00] mt-0.5 flex-shrink-0" />
                    <span>
                      {[b.area, b.city, b.state].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                {b.mobile && (
                  <div className="flex items-center gap-2 text-[13px] text-neutral-600">
                    <Phone size={14} className="text-[#FF6B00] flex-shrink-0" />
                    <span>{b.mobile}</span>
                  </div>
                )}
                {b.contact_person && (
                  <div className="text-[12px] text-neutral-400 font-semibold">
                    Contact: {b.contact_person}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
