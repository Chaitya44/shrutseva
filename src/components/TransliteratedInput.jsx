/**
 * TransliteratedInput — Reusable input with Gujarati/Hindi/English toggle
 * + Google Transliteration suggestions (no "Did you mean", just pills)
 * + Compatible with Google Indic Keyboard browser extension (standard input, no blocking)
 */
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { fetchGoogleTransliteration } from '../utils/transliteration';

const LANGS = ['Gu', 'Hi', 'En'];
const LANG_FULL = { Gu: 'Gujarati', Hi: 'Hindi', En: 'English' };
const LANG_COLOR = {
  Gu: 'bg-orange-500 text-white',
  Hi: 'bg-[#012c77] text-white',
  En: 'bg-neutral-200 text-neutral-700',
};

function sanitize(str) {
  return String(str || '').replace(/<[^>]*>/g, '').trim().slice(0, 500);
}

export default function TransliteratedInput({
  value,
  onChange,
  placeholder = 'Type to search...',
  className = '',
  inputClassName = '',
  id,
  onKeyDown,
  autoFocus,
}) {
  const [activeLang, setActiveLang] = useState('Gu');
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);

  // Fetch Google Transliteration suggestions
  useEffect(() => {
    if (activeLang === 'En' || !value || !focused) {
      setSuggestions([]);
      return;
    }
    // Only trigger for Latin (Roman) characters — so Google can convert to Indic
    if (!/[a-zA-Z]/.test(value)) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      const results = await fetchGoogleTransliteration(value, LANG_FULL[activeLang]);
      setSuggestions(results || []);
    }, 250);
    return () => clearTimeout(timer);
  }, [value, activeLang, focused]);

  // Close suggestions on outside click
  useEffect(() => {
    function handler(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const applySuggestion = (s) => {
    onChange(s);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleChange = (e) => {
    // Allow Google Indic Keyboard extension — do not preventDefault on composition events
    onChange(sanitize(e.target.value));
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Input + lang toggle row */}
      <div className="flex items-stretch gap-0 rounded-xl overflow-hidden border border-neutral-200 focus-within:border-[#012c77] transition-colors bg-white/80 backdrop-blur shadow-sm">
        
        {/* Text input — standard input, Google Indic extension works natively */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          // Do NOT block compositionstart/end — this allows Google Indic extension to work
          lang={activeLang === 'Gu' ? 'gu' : activeLang === 'Hi' ? 'hi' : 'en'}
          className={`flex-1 min-w-0 px-4 py-2.5 text-[13.5px] outline-none bg-transparent text-neutral-800 placeholder:text-neutral-400 ${inputClassName}`}
        />

        {/* Language toggle pills */}
        <div className="flex items-center gap-0.5 pr-2 pl-1 shrink-0">
          {LANGS.map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => { setActiveLang(lang); setSuggestions([]); inputRef.current?.focus(); }}
              title={LANG_FULL[lang]}
              className={`text-[10px] font-black px-2 py-1 rounded-lg transition-all cursor-pointer select-none ${
                activeLang === lang ? LANG_COLOR[lang] : 'text-neutral-400 hover:bg-neutral-100'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Transliteration suggestion pills — no "Did you mean", just pills */}
      <AnimatePresence>
        {suggestions.length > 0 && focused && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-1.5 z-50 flex flex-wrap gap-1.5 bg-white/95 backdrop-blur-xl border border-neutral-200 rounded-xl px-3 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          >
            {suggestions.slice(0, 6).map((s, i) => (
              <button
                key={i}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); applySuggestion(s); }}
                className={`px-3 py-1 rounded-lg text-[13px] font-semibold border transition-all cursor-pointer ${
                  i === 0
                    ? 'bg-[#012c77] text-white border-[#012c77] shadow-sm'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-[#012c77]/8 hover:border-[#012c77]/30'
                }`}
              >
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
