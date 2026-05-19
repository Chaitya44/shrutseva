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
  <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.04)] border border-white/60 flex items-start gap-4 hover:shadow-[0_8px_24px_rgba(0,182,190,0.1)] transition-all duration-300">
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shrink-0 border border-blue-100 shadow-inner">
      <Icon size={18} className="text-[#0D47A1]" strokeWidth={2.5} />
    </div>
    <div className="flex flex-col">
      <span className="text-[11px] font-bold text-[#0D47A1] uppercase tracking-wider mb-1">{label}</span>
      <span className="text-[13px] font-semibold text-neutral-800 leading-tight">{value || '-'}</span>
    </div>
  </div>
);

export default function ExpandedBookDetails({ book }) {
  const details = [
    { icon: BookOpen, label: 'Name', value: book?.name },
    { icon: Layers, label: 'Part', value: book?.part },
    { icon: Type, label: 'Alternate Name', value: book?.alternateName },
    { icon: PenTool, label: 'Kruti', value: book?.kruti },
    { icon: User, label: 'Author', value: book?.author },
    { icon: Edit3, label: 'Editor', value: book?.editor },
    { icon: Globe, label: 'Language', value: book?.languageFull },
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

      <div className="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-8">
        
        {/* Left Side - Image Slider (Placeholder) */}
        <div className="w-full lg:w-[260px] shrink-0 flex items-center justify-center">
          <button className="w-8 h-8 rounded-full bg-[#1E88E5] text-white flex items-center justify-center shadow-lg hover:bg-[#1565C0] transition-colors -mr-4 z-20">
            <ChevronLeft size={20} strokeWidth={2.5} />
          </button>
          
          <div className="relative w-[200px] h-[280px] bg-white rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.1)] border-4 border-white flex flex-col items-center justify-center p-6 text-center z-10">
             <div className="w-24 h-24 mb-4 opacity-50">
               {/* Abstract book graphic instead of image */}
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full text-[#1E88E5]">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
               </svg>
             </div>
             <span className="text-[13px] font-bold text-[#0A2540]/60">Image Not Available</span>
          </div>

          <button className="w-8 h-8 rounded-full bg-[#1E88E5] text-white flex items-center justify-center shadow-lg hover:bg-[#1565C0] transition-colors -ml-4 z-20">
            <ChevronRight size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Right Side - Details and Table */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Section Title */}
          <div className="mb-4">
            <h3 className="text-[20px] font-bold text-[#0D47A1] font-heading flex items-center gap-2">
              Book Details
            </h3>
            <div className="w-12 h-1 bg-gradient-to-r from-[#FF6B00] to-[#FFA726] rounded-full mt-1.5"></div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 mb-8">
            {details.map((detail, idx) => (
              <DetailCard key={idx} icon={detail.icon} label={detail.label} value={detail.value} />
            ))}
            
            {/* Arrow Button at the end of details */}
            <div className="flex items-center justify-center">
               <button className="w-10 h-10 rounded-full bg-[#00b6be] text-white flex items-center justify-center shadow-lg hover:bg-[#009ca3] transition-transform hover:scale-105">
                 <ArrowRight size={20} strokeWidth={2.5} />
               </button>
            </div>
          </div>

          {/* Bhandar Table Section */}
          <div>
            <div className="mb-4">
              <h3 className="text-[20px] font-bold text-[#0D47A1] font-heading flex items-center gap-2">
                Available In Bhandar
              </h3>
              <div className="w-12 h-1 bg-gradient-to-r from-[#FF6B00] to-[#FFA726] rounded-full mt-1.5"></div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#1D4ED8] to-[#00b6be]">
                      <th className="px-5 py-3.5 text-[13px] font-bold text-white tracking-wide border-r border-white/20 w-[15%]">
                         <div className="flex items-center gap-2"><BookOpen size={14}/> Book Number</div>
                      </th>
                      <th className="px-5 py-3.5 text-[13px] font-bold text-white tracking-wide border-r border-white/20 w-[45%]">
                         <div className="flex items-center gap-2"><Building2 size={14}/> Bhandar Name</div>
                      </th>
                      <th className="px-5 py-3.5 text-[13px] font-bold text-white tracking-wide border-r border-white/20 w-[20%]">
                         <div className="flex items-center gap-2"><Globe size={14}/> City</div>
                      </th>
                      <th className="px-5 py-3.5 text-[13px] font-bold text-white tracking-wide w-[20%]">
                         <div className="flex items-center gap-2"><User size={14}/> Contact</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(book?.bhandars || []).map((bhandar, idx) => (
                      <tr key={idx} className="border-b border-neutral-100 hover:bg-[#F8FAFC] transition-colors bg-white">
                        <td className="px-5 py-4 text-[14px] font-bold text-neutral-800">{bhandar.bookNumber}</td>
                        <td className="px-5 py-4 text-[14px] font-semibold text-neutral-700">{bhandar.name}</td>
                        <td className="px-5 py-4 text-[14px] font-medium text-neutral-600">{bhandar.city}</td>
                        <td className="px-5 py-4 text-[14px] font-semibold text-[#1E88E5] flex items-center gap-1.5">
                          <span className="w-6 h-6 rounded-full bg-[#1E88E5]/10 flex items-center justify-center shrink-0">📞</span>
                          {bhandar.contact}
                        </td>
                      </tr>
                    ))}
                    {(!book?.bhandars || book.bhandars.length === 0) && (
                      <tr>
                        <td colSpan="4" className="px-5 py-8 text-center text-neutral-500 font-medium">
                          No bhandar details available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
