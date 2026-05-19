import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Library, BookMarked, Sparkles, Boxes, Database, ChevronDown, MapPin,
  TrendingUp, BarChart2, CheckCircle2, Award, Clock, ArrowUpRight, Search, Copy, Check, Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BhandarPageSelector from '../components/BhandarPageSelector';

export default function Dashboard() {
  const { selectedBhandar } = useAuth();
  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredLangBar, setHoveredLangBar] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [sizeView, setSizeView] = useState('bar'); // 'bar' or 'donut'
  const [langSearch, setLangSearch] = useState('');
  
  // Dynamic API integration states
  const [statsData, setStatsData] = useState([]);
  const [sizeChartData, setSizeChartData] = useState([]);
  const [langChartData, setLangChartData] = useState([]);
  const [tableDataList, setTableDataList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/front/dashboard_stats?bhandar=${encodeURIComponent(selectedBhandar)}`);
        const json = await res.json();
        if (json.status === 'success' && active) {
          const apiData = json.data;

          const dynamicStats = [
            { 
              label: 'TOTAL BOOKS', 
              value: String(apiData.stats.totalBooks), 
              icon: Library, 
              gradient: 'from-[#1D4ED8] via-[#3b82f6] to-[#60a5fa]', 
              trend: 'Live Database', 
              trendColor: 'text-emerald-600',
              bgStyle: 'from-[#1D4ED8]/5 to-[#60a5fa]/5',
              hoverBg: 'hover:from-[#1D4ED8]/10 hover:to-[#60a5fa]/10',
              borderStyle: 'border-[#1D4ED8]/20 group-hover:border-[#1D4ED8]/40',
              textStyle: 'from-[#1D4ED8] to-[#3b82f6]'
            },
            { 
              label: 'ISSUED BOOKS', 
              value: String(apiData.stats.totalIssuedBooks), 
              icon: BookMarked, 
              gradient: 'from-[#00b6be] via-[#00d2d3] to-[#48dbfb]', 
              trend: 'Active now', 
              trendColor: 'text-teal-600',
              bgStyle: 'from-[#00b6be]/5 to-[#48dbfb]/5',
              hoverBg: 'hover:from-[#00b6be]/10 hover:to-[#48dbfb]/10',
              borderStyle: 'border-[#00b6be]/20 group-hover:border-[#00b6be]/40',
              textStyle: 'from-[#00b6be] to-[#00d2d3]'
            },
            { 
              label: 'ADDED IN LAST MONTH', 
              value: String(apiData.stats.totalAddedInLastMonth), 
              icon: Sparkles, 
              gradient: 'from-[#FF6B00] via-[#FF9F1C] to-[#FFD166]', 
              trend: 'Dynamic period', 
              trendColor: 'text-amber-600',
              bgStyle: 'from-[#FF6B00]/5 to-[#FFD166]/5',
              hoverBg: 'hover:from-[#FF6B00]/10 hover:to-[#FFD166]/10',
              borderStyle: 'border-[#FF6B00]/20 group-hover:border-[#FF6B00]/40',
              textStyle: 'from-[#FF6B00] to-[#FF9F1C]'
            },
            { 
              label: 'BOOK SIZES', 
              value: String(apiData.stats.totalSizes), 
              icon: Boxes, 
              gradient: 'from-[#4F46E5] via-[#7C3AED] to-[#A78BFA]', 
              trend: 'All categorized', 
              trendColor: 'text-indigo-600',
              bgStyle: 'from-[#4F46E5]/5 to-[#A78BFA]/5',
              hoverBg: 'hover:from-[#4F46E5]/10 hover:to-[#A78BFA]/10',
              borderStyle: 'border-[#4F46E5]/20 group-hover:border-[#4F46E5]/40',
              textStyle: 'from-[#4F46E5] to-[#7C3AED]'
            }
          ];

          setStatsData(dynamicStats);
          setSizeChartData(apiData.sizeChart);
          setLangChartData(apiData.langChart);
          setTableDataList(apiData.tableData);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchStats();
    return () => {
      active = false;
    };
  }, [selectedBhandar]);

  // Maximum values for chart scaling
  const maxBooksSize = sizeChartData.length > 0 ? Math.max(...sizeChartData.map(d => d.value)) : 1;
  const filteredLangs = langChartData.filter(d => 
    d.label.toLowerCase().includes(langSearch.toLowerCase())
  );
  const maxBooksLang = filteredLangs.length > 0 ? Math.max(...filteredLangs.map(d => d.value)) : 1;

  return (
    <div className="w-full max-w-[1400px] px-4 sm:px-6 mx-auto pb-8 pt-14 sm:pt-16 overflow-y-auto relative">

      {/* Background Neon glowing spots for elite dashboard feel */}
      <div className="absolute top-[10%] left-[20%] w-[300px] h-[300px] rounded-full bg-[#1565FF]/10 blur-[80px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] rounded-full bg-[#00b6be]/10 blur-[100px] pointer-events-none z-0" />

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <h1 className="text-[28px] sm:text-[34px] font-heading font-extrabold tracking-tight leading-none mb-1">
              <span className="text-[#012c77]">Dash</span><span className="text-[#FF6B00]">board</span>
            </h1>
            <span className="text-[11px] font-bold text-neutral-400 tracking-wide uppercase">Institutional Library Analytics Console</span>
          </div>
        </div>
        <BhandarPageSelector />
      </div>

      {/* ── Stats Row ──────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsData.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
              className={`relative overflow-hidden bg-gradient-to-br ${stat.bgStyle} ${stat.hoverBg} backdrop-blur-2xl rounded-2xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.01)] border ${stat.borderStyle} flex items-center gap-4 hover:shadow-[0_16px_40px_rgba(29,78,216,0.05)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer`}
            >
              {/* Vertical left accent brand color strip */}
              <div className={`absolute left-0 top-0 bottom-0 w-[4.5px] bg-gradient-to-b ${stat.gradient}`} />

              {/* Glossy top glass reflection overlay */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none rounded-t-2xl" />
              
              {/* Color Gradient Icon Badge */}
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 relative z-10`}>
                <Icon size={20} strokeWidth={2.5} className="text-white" />
              </div>
              
              <div className="flex flex-col min-w-0 flex-1 relative z-10">
                <span className="text-[9.5px] font-bold text-neutral-400 tracking-wider uppercase truncate leading-none mb-1.5">{stat.label}</span>
                {/* Stunning Premium Clip-Text Gradient Value Number */}
                <span className={`text-2xl font-black bg-gradient-to-r ${stat.textStyle} bg-clip-text text-transparent tracking-tight leading-none mb-1.5`}>
                  {stat.value}
                </span>
                <span className={`text-[10px] font-bold ${stat.trendColor} flex items-center gap-0.5 leading-none`}>
                  <ArrowUpRight size={10} strokeWidth={3} className="shrink-0" />
                  {stat.trend}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Charts Grid ────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Size Chart Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative lg:col-span-5 bg-gradient-to-br from-[#FF6B00]/5 via-[#FF6B00]/2 to-white/90 backdrop-blur-xl rounded-[24px] p-5 shadow-[0_16px_48px_rgba(255,107,0,0.04)] border border-white/60 hover:border-[#FF6B00]/30 transition-colors duration-300 flex flex-col min-w-0 h-[380px] group"
        >
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/70 to-transparent pointer-events-none rounded-t-[24px]" />
          
          <div className="relative z-10 flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-6 h-6 rounded-lg bg-[#FF6B00]/10 flex items-center justify-center shrink-0">
                <TrendingUp size={14} className="text-[#FF6B00]" strokeWidth={2.5} />
              </div>
              <h3 className="text-[15px] font-heading font-extrabold text-[#0A2540]">Books by Size</h3>
              
              {hoveredBar !== null && sizeView === 'bar' && sizeChartData[hoveredBar.split('-')[1]] && (
                <span className="text-[11px] font-black text-[#FF6B00] bg-[#FF6B00]/10 px-2 py-0.5 rounded-full border border-[#FF6B00]/20 animate-pulse transition-all">
                  Size {sizeChartData[hoveredBar.split('-')[1]].label}: {sizeChartData[hoveredBar.split('-')[1]].value} books ({sizeChartData[hoveredBar.split('-')[1]].percent}%)
                </span>
              )}
            </div>

            {/* Premium toggle view tab buttons */}
            <div className="flex items-center p-0.5 bg-neutral-100/80 rounded-full overflow-hidden border border-neutral-200/50">
              <button 
                onClick={() => setSizeView('bar')}
                className={`px-3 py-1 rounded-full text-[10.5px] font-bold uppercase transition-all cursor-pointer ${sizeView === 'bar' ? 'bg-[#FF6B00] text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
              >
                Bar
              </button>
              <button 
                onClick={() => setSizeView('donut')}
                className={`px-3 py-1 rounded-full text-[10.5px] font-bold uppercase transition-all cursor-pointer ${sizeView === 'donut' ? 'bg-[#FF6B00] text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
              >
                Donut
              </button>
            </div>
          </div>

          {/* Dynamic render based on view option */}
          <div className="relative z-10 flex-1 h-full flex items-center justify-center">
            {sizeView === 'bar' ? (
              <div className="w-full h-full flex items-end justify-between gap-2 px-2 pb-6 pt-4 relative">
                {/* Visual grid lines behind charts */}
                <div className="absolute inset-x-0 top-6 bottom-14 flex flex-col justify-between pointer-events-none opacity-40 z-0">
                  <div className="border-b border-neutral-100 w-full" />
                  <div className="border-b border-neutral-100 w-full" />
                  <div className="border-b border-neutral-100 w-full" />
                </div>

                {sizeChartData.map((d, index) => {
                  const heightPercent = `${(d.value / maxBooksSize) * 80}%`;
                  const isHovered = hoveredBar === `size-${index}`;
                  const isAnyHovered = hoveredBar !== null;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end z-10">
                      
                      {/* Floating Micro Tooltip */}
                      {isHovered && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[11px] font-black px-2 py-0.5 rounded shadow-lg pointer-events-none z-30 whitespace-nowrap">
                          {d.value} ({d.percent}%)
                        </div>
                      )}

                      {/* Glassmorphic Bar */}
                      <div 
                        onMouseEnter={() => setHoveredBar(`size-${index}`)}
                        onMouseLeave={() => setHoveredBar(null)}
                        style={{ height: heightPercent }}
                        className={`w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-[#FF6B00] to-[#FFB800] cursor-pointer transition-all duration-300 relative ${isAnyHovered && !isHovered ? 'opacity-30 scale-x-95' : 'opacity-100 shadow-[0_4px_16px_rgba(255,107,0,0.25)]'}`}
                      >
                        {/* Glow on hover */}
                        {isHovered && (
                          <div className="absolute inset-0 bg-gradient-to-t from-[#FF6B00] to-[#FFD600] rounded-t-lg blur-[4px] opacity-80" />
                        )}
                        <div className="absolute inset-0 bg-white/15 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
                      </div>

                      {/* X-Axis Label */}
                      <span className={`text-[11px] font-extrabold mt-2 leading-none transition-colors duration-200 ${isHovered ? 'text-[#FF6B00]' : 'text-[#0A2540]'}`}>{d.label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Stunning customized SVG Donut Chart representing size distribution dynamically
              <div className="w-full flex items-center justify-center gap-6 pb-4">
                <div className="relative w-44 h-44 shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 42 42">
                    <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#F1F5F9" strokeWidth="4.5" />
                    
                    {(() => {
                      let accumulatedPercent = 0;
                      const colors = ['#1D4ED8', '#4F46E5', '#FF6B00', '#00b6be', '#8B5CF6', '#EC4899', '#10B981'];
                      return sizeChartData.map((d, index) => {
                        const strokeDash = `${d.percent} ${100 - d.percent}`;
                        const strokeOffset = -accumulatedPercent;
                        accumulatedPercent += d.percent;
                        const color = colors[index % colors.length];
                        return (
                          <circle 
                            key={index}
                            cx="21" 
                            cy="21" 
                            r="15.915" 
                            fill="transparent" 
                            stroke={color} 
                            strokeWidth="4.5" 
                            strokeDasharray={strokeDash} 
                            strokeDashoffset={strokeOffset} 
                            className="transition-all duration-300"
                          />
                        );
                      });
                    })()}
                  </svg>
                  {/* Central Text Panel */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black text-neutral-400 tracking-wider">TOP SIZE</span>
                    <span className="text-[22px] font-black text-[#0A2540] leading-none">
                      {sizeChartData.reduce((prev, current) => (prev.value > current.value) ? prev : current, {label: '-'}).label}
                    </span>
                    <span className="text-[10px] font-bold text-neutral-500 mt-0.5">
                      {sizeChartData.reduce((prev, current) => (prev.value > current.value) ? prev : current, {percent: 0}).percent}%
                    </span>
                  </div>
                </div>
                {/* Legended Details */}
                <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1 select-none scrollbar-thin">
                  {(() => {
                    const colors = ['#1D4ED8', '#4F46E5', '#FF6B00', '#00b6be', '#8B5CF6', '#EC4899', '#10B981'];
                    return sizeChartData.map((d, index) => {
                      const color = colors[index % colors.length];
                      return (
                        <div key={index} className="flex items-center gap-2 text-[11px] font-bold text-neutral-600">
                          <span className="w-2.5 h-2.5 rounded shrink-0" style={{ backgroundColor: color }} /> 
                          Size {d.label}: {d.percent}%
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Language Chart Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="relative lg:col-span-7 bg-gradient-to-br from-[#00b6be]/5 via-[#00b6be]/2 to-white/90 backdrop-blur-xl rounded-[24px] p-5 shadow-[0_16px_48px_rgba(0,182,190,0.04)] border border-white/60 hover:border-[#00b6be]/30 transition-colors duration-300 flex flex-col min-w-0 h-[380px] group"
        >
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/70 to-transparent pointer-events-none rounded-t-[24px]" />
          
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-6 h-6 rounded-lg bg-[#00b6be]/10 flex items-center justify-center shrink-0">
                <TrendingUp size={14} className="text-[#00b6be]" strokeWidth={2.5} />
              </div>
              <h3 className="text-[15px] font-heading font-extrabold text-[#0A2540]">Books by Language</h3>
              
              {hoveredLangBar !== null && (
                <span className="text-[11px] font-black text-[#00b6be] bg-[#00b6be]/10 px-2 py-0.5 rounded-full border border-[#00b6be]/20 animate-pulse transition-all">
                  {filteredLangs[hoveredLangBar].label}: {filteredLangs[hoveredLangBar].value} books
                </span>
              )}
            </div>

            {/* Dynamic Search Box for Languages chart */}
            <div className="relative w-full sm:w-[180px]">
              <input 
                type="text" 
                placeholder="Filter language..." 
                value={langSearch}
                onChange={(e) => setLangSearch(e.target.value)}
                className="w-full border border-neutral-200 focus:border-[#00b6be] transition-all rounded-lg pl-8 pr-2.5 py-1 text-[11.5px] text-neutral-800 outline-none bg-neutral-50/50 font-bold placeholder:text-neutral-300"
              />
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Search size={12} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* SVG Custom High-End Scrollable Bar Chart */}
          <div className="relative z-10 flex-1 overflow-x-auto overflow-y-hidden pb-2 scrollbar-thin">
            <div className="flex items-end justify-between gap-1.5 px-2 pb-8 pt-6 h-full min-w-[680px]">
              {filteredLangs.map((d, index) => {
                const heightPercent = `${(d.value / maxBooksLang) * 72}%`;
                const isHovered = hoveredLangBar === index;
                const isAnyHovered = hoveredLangBar !== null;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center group relative h-full justify-end min-w-[24px]">
                    
                    {/* Floating Micro Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg pointer-events-none z-30 whitespace-nowrap">
                        {d.value}
                      </div>
                    )}

                    {/* Glassmorphic Bar */}
                    <div 
                      onMouseEnter={() => setHoveredLangBar(index)}
                      onMouseLeave={() => setHoveredLangBar(null)}
                      style={{ height: heightPercent }}
                      className={`w-full max-w-[16px] rounded-t bg-gradient-to-t from-[#1565FF] to-[#00b6be] cursor-pointer transition-all duration-300 relative ${isAnyHovered && !isHovered ? 'opacity-30 scale-x-90' : 'opacity-100'}`}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-t" />
                    </div>

                    {/* X-Axis Label */}
                    <span className={`text-[10px] font-extrabold mt-3.5 whitespace-nowrap leading-none transition-all duration-200 rotate-[25deg] sm:rotate-0 origin-left translate-x-1 sm:translate-x-0 ${isHovered ? 'text-[#00b6be]' : 'text-[#0A2540]'}`}>{d.label}</span>
                  </div>
                );
              })}
              {filteredLangs.length === 0 && (
                <div className="w-full flex flex-col items-center justify-center h-full text-center py-10">
                  <span className="text-[13px] font-bold text-neutral-400">No language matches filters</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

      </div>

      {/* ── Table Section ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="relative overflow-hidden bg-gradient-to-br from-[#1D4ED8]/3 via-white/90 to-[#00b6be]/3 backdrop-blur-xl rounded-[24px] shadow-[0_16px_48px_rgba(0,0,0,0.03)] border border-white/60 hover:border-[#1D4ED8]/20 transition-colors duration-300"
      >
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/70 to-transparent pointer-events-none rounded-t-[24px]" />

        {/* Table header bar */}
        <div className="relative z-10 flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1D4ED8] to-[#00b6be] flex items-center justify-center">
              <Database size={14} strokeWidth={2.5} className="text-white" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-[15px] font-heading font-extrabold text-[#0A2540] leading-none mb-0.5">Book Size Details</h2>
              <span className="text-[10px] font-bold text-neutral-400 tracking-wide uppercase">Size Categories Master File</span>
            </div>
          </div>
        </div>

        {/* Scrollable table */}
        <div className="relative z-10 overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-gradient-to-r from-[#1D4ED8] to-[#00b6be] text-white">
                <th className="px-5 py-3 text-left font-bold w-[20%] whitespace-nowrap">Book Size</th>
                <th className="px-5 py-3 text-left font-bold w-[25%] whitespace-nowrap">Last Book No.</th>
                <th className="px-5 py-3 text-left font-bold w-[30%] whitespace-nowrap">Total Books (Weight)</th>
                <th className="px-5 py-3 text-left font-bold w-[25%] whitespace-nowrap">Last Modified Date</th>
              </tr>
            </thead>
            <tbody>
              {tableDataList.map((row, i) => (
                <tr key={i} className={`border-b border-neutral-50 hover:bg-[#00b6be]/5 transition-colors group ${i % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'}`}>
                  {/* Book Size Badge */}
                  <td className="px-5 py-3.5 align-middle">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#1D4ED8]/10 text-[#1D4ED8] font-black text-[12px] group-hover:scale-110 group-hover:bg-[#1D4ED8] group-hover:text-white transition-all duration-300 shadow-sm">
                      {row.size}
                    </span>
                  </td>
                  
                  {/* Book Number Accent with Click-to-Copy */}
                  <td className="px-5 py-3.5 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#FF6B00] tracking-wider font-mono">{row.lastNo}</span>
                      <button 
                        onClick={() => handleCopy(row.lastNo)}
                        className="w-5 h-5 rounded hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-[#FF6B00] transition-colors cursor-pointer"
                        title="Copy Book No."
                      >
                        {copiedId === row.lastNo ? <Check size={11} className="text-emerald-500" strokeWidth={3} /> : <Copy size={11} />}
                      </button>
                      <AnimatePresence>
                        {copiedId === row.lastNo && (
                          <motion.span 
                            initial={{ opacity: 0, x: -3 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -3 }}
                            className="text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded"
                          >
                            Copied!
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                  
                  {/* Weight Progress Bar */}
                  <td className="px-5 py-3.5 align-middle">
                    <div className="flex flex-col gap-1 w-full max-w-[200px]">
                      <div className="flex items-center justify-between text-[11px] font-bold text-neutral-500 leading-none">
                        <span>{row.total} books</span>
                        <span>{row.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${row.progress}%` }} 
                          className="h-full bg-gradient-to-r from-[#1D4ED8] to-[#00b6be] rounded-full group-hover:opacity-90 transition-opacity" 
                        />
                      </div>
                    </div>
                  </td>

                  {/* Date Column */}
                  <td className="px-5 py-3.5 text-neutral-500 font-semibold align-middle">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-neutral-400 shrink-0" />
                      <span>{row.date}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
