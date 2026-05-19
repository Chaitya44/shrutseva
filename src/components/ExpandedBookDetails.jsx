import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Layers,
  Type,
  PenTool,
  User,
  Edit3,
  Globe,
  Building2,
  FileText,
  Calendar,
  Bookmark,
  ShieldCheck,
  ClipboardList,
  List
} from 'lucide-react';

const DetailCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white/80 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-white/60 flex items-start gap-3 sm:gap-4 hover:shadow-[0_8px_24px_rgba(0,182,190,0.1)] transition-all duration-300">
    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0 border border-blue-100 shadow-inner">
      <Icon size={15} className="text-[#0D47A1] sm:size-[18px]" strokeWidth={2.5} />
    </div>
    <div className="flex flex-col min-w-0">
      <span className="text-[9.5px] sm:text-[11px] font-bold text-[#0D47A1] uppercase tracking-wider mb-0.5 sm:mb-1">{label}</span>
      <span className="text-[12px] sm:text-[13px] font-semibold text-neutral-800 leading-tight truncate">{value || '-'}</span>
    </div>
  </div>
);

const mapLanguageInitialToFull = (initial) => {
  if (!initial) return '-';
  const val = initial.trim();
  const results = [];
  
  if (/[Ggગુ]/u.test(val)) results.push('Gujarati');
  if (/[HhહિહDd]/u.test(val)) results.push('Hindi');
  if (/[Ssસં]/u.test(val)) results.push('Sanskrit');
  if (/[Ppપ્રા]/u.test(val)) results.push('Prakrit');
  if (/[Eeઅંઇ]/u.test(val) || val.toLowerCase().includes('english')) results.push('English');
  
  if (results.length > 0) {
    return results.join(', ');
  }
  return initial;
};

export default function ExpandedBookDetails({ book }) {
  const details = [
    { icon: BookOpen, label: 'Name', value: book?.name },
    { icon: Layers, label: 'Part', value: book?.part },
    { icon: Type, label: 'Alternate Name', value: book?.alternateName },
    { icon: PenTool, label: 'Kruti', value: book?.kruti },
    { icon: User, label: 'Author', value: book?.author },
    { icon: Edit3, label: 'Editor', value: book?.editor },
    { icon: Globe, label: 'Language', value: mapLanguageInitialToFull(book?.languageFull) },
    { icon: Building2, label: 'Publisher', value: book?.publisher },
    { icon: FileText, label: 'Page', value: book?.page },
    { icon: Calendar, label: 'Year', value: book?.year },
    { icon: Bookmark, label: 'Edition', value: book?.edition },
    { icon: ShieldCheck, label: 'Subject', value: book?.subject },
    { icon: ClipboardList, label: 'Note', value: book?.note },
    { icon: List, label: 'Particular', value: book?.particular },
  ];

  return (
    <div className="relative w-full p-4 sm:p-6 bg-gradient-to-br from-[#E3F2FD]/80 via-white to-[#E0F7FA]/50 overflow-hidden">
      {/* Decorative Wave/Abstract Background - SVG */}
      <div className="absolute top-0 right-0 w-full h-full pointer-events-none opacity-40">
         <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="w-full h-full absolute inset-0 text-[#00b6be]/20 fill-current">
            <path d="M0,0 C200,100 300,50 500,150 C700,250 800,200 1000,100 L1000,0 L0,0 Z" />
            <path d="M0,300 C250,200 350,250 600,150 C850,50 950,100 1000,200 L1000,300 L0,300 Z" className="text-[#0D47A1]/5" />
         </svg>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row gap-5 lg:gap-8">
        
        {/* Left Side - Image Slider (Compact on mobile, standard on desktop) */}
        <div className="w-full lg:w-[240px] shrink-0 flex items-center justify-center gap-2 lg:gap-0">
          <button className="w-8 h-8 rounded-full bg-[#1E88E5] text-white flex items-center justify-center shadow-lg hover:bg-[#1565C0] transition-colors lg:-mr-4 z-20 shrink-0">
            <ChevronLeft size={18} strokeWidth={2.5} />
          </button>
          
          <div className="relative w-[180px] h-[240px] lg:w-[200px] lg:h-[280px] bg-white rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.08)] border-4 border-white flex flex-col items-center justify-center p-4 text-center z-10">
             <div className="w-16 h-16 lg:w-24 lg:h-24 mb-3 lg:mb-4 opacity-40">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full text-[#1E88E5]">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
               </svg>
             </div>
             <span className="text-[12px] lg:text-[13px] font-extrabold text-[#0A2540]/60">Image Not Available</span>
          </div>

          <button className="w-8 h-8 rounded-full bg-[#1E88E5] text-white flex items-center justify-center shadow-lg hover:bg-[#1565C0] transition-colors lg:-ml-4 z-20 shrink-0">
            <ChevronRight size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* Right Side - Details and Table */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Section Title */}
          <div className="mb-3.5">
            <h3 className="text-[18px] sm:text-[20px] font-extrabold text-[#0D47A1] font-heading flex items-center gap-2">
              Book Details
            </h3>
            <div className="w-12 h-1 bg-gradient-to-r from-[#FF6B00] to-[#FFA726] rounded-full mt-1.5"></div>
          </div>

          {/* Details Grid (Highly Responsive columns) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 mb-6">
            {details.map((detail, idx) => (
              <DetailCard key={idx} icon={detail.icon} label={detail.label} value={detail.value} />
            ))}
            
            {/* Arrow Button at the end of details */}
            <div className="flex items-center justify-center p-3">
               <button className="w-9 h-9 rounded-full bg-[#00b6be] text-white flex items-center justify-center shadow-lg hover:bg-[#009ca3] transition-transform hover:scale-105">
                 <ArrowRight size={18} strokeWidth={2.5} />
               </button>
            </div>
          </div>

          {/* Bhandar Table Section */}
          <div>
            <div className="mb-3.5">
              <h3 className="text-[18px] sm:text-[20px] font-extrabold text-[#0D47A1] font-heading flex items-center gap-2">
                Available In Bhandar
              </h3>
              <div className="w-12 h-1 bg-gradient-to-r from-[#FF6B00] to-[#FFA726] rounded-full mt-1.5"></div>
            </div>

            {/* Bhandar Desktop View (sm and larger) */}
            <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#1D4ED8] to-[#00b6be]">
                      <th className="px-4 py-3 text-[12.5px] font-bold text-white tracking-wide border-r border-white/20 w-[15%]">
                         <div className="flex items-center gap-1.5"><BookOpen size={13}/> Book Number</div>
                      </th>
                      <th className="px-4 py-3 text-[12.5px] font-bold text-white tracking-wide border-r border-white/20 w-[45%]">
                         <div className="flex items-center gap-1.5"><Building2 size={13}/> Bhandar Name</div>
                      </th>
                      <th className="px-4 py-3 text-[12.5px] font-bold text-white tracking-wide border-r border-white/20 w-[20%]">
                         <div className="flex items-center gap-1.5"><Globe size={13}/> City</div>
                      </th>
                      <th className="px-4 py-3 text-[12.5px] font-bold text-white tracking-wide w-[20%]">
                         <div className="flex items-center gap-1.5"><User size={13}/> Contact</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(book?.bhandars || []).map((bhandar, idx) => (
                      <tr key={idx} className="border-b border-neutral-100 hover:bg-[#F8FAFC] transition-colors bg-white">
                        <td className="px-4 py-3 text-[13px] font-bold text-neutral-800">{bhandar.bookNumber}</td>
                        <td className="px-4 py-3 text-[13px] font-semibold text-neutral-700">{bhandar.name}</td>
                        <td className="px-4 py-3 text-[13px] font-medium text-neutral-600">{bhandar.city}</td>
                        <td className="px-4 py-3 text-[13px] font-semibold text-[#1E88E5] flex items-center gap-1.5">
                          <span className="w-5.5 h-5.5 rounded-full bg-[#1E88E5]/10 flex items-center justify-center shrink-0">📞</span>
                          {bhandar.contact}
                        </td>
                      </tr>
                    ))}
                    {(!book?.bhandars || book.bhandars.length === 0) && (
                      <tr>
                        <td colSpan="4" className="px-4 py-6 text-center text-neutral-500 font-medium">
                          No bhandar details available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bhandar Mobile List View (< sm) */}
            <div className="block sm:hidden space-y-2.5">
              {(book?.bhandars || []).map((bhandar, idx) => (
                <div key={idx} className="bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-neutral-200/50 shadow-sm flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                    <span className="text-[12.5px] font-extrabold text-[#0D47A1] flex items-center gap-1.5">
                      <BookOpen size={13} className="text-[#0D47A1] shrink-0" /> No. {bhandar.bookNumber}
                    </span>
                    <span className="text-[11px] font-bold text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-0.5 rounded-md">
                      {bhandar.city}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[13.5px] font-extrabold text-[#0A2540] leading-snug">{bhandar.name}</span>
                    <a href={`tel:${bhandar.contact}`} className="text-[12.5px] font-bold text-[#1E88E5] flex items-center gap-1.5 mt-1 hover:underline">
                      <span className="w-5 h-5 rounded-full bg-[#1E88E5]/10 flex items-center justify-center shrink-0">📞</span>
                      {bhandar.contact}
                    </a>
                  </div>
                </div>
              ))}
              {(!book?.bhandars || book.bhandars.length === 0) && (
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-5 border border-neutral-200/50 text-center text-neutral-500 font-semibold text-[13px]">
                  No bhandar details available.
                </div>
              )}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
