/**
 * Unified Transliteration Utility for ShrutSeva
 * Supports:
 * 1. Indic (Gujarati / Devanagari) to English (Phonetic Romanization)
 * 2. Live Google Input Tools Transliteration API for extremely accurate, grammatically correct spelling.
 */

// Mapping of Unicode offsets relative to script blocks (Gujarati: 0x0A80, Devanagari: 0x0900)
const offsetMap = {
  // Vowels
  0x05: 'a',   // અ / अ
  0x06: 'aa',  // આ / आ
  0x07: 'i',   // ઇ / इ
  0x08: 'ee',  // ઈ / ई
  0x09: 'u',   // ઉ / उ
  0x0a: 'oo',  // ઊ / ऊ
  0x0b: 'ri',  // ઋ / ऋ
  0x0f: 'e',   // એ / ए
  0x10: 'ai',  // ઐ / ऐ
  0x13: 'o',   // ઓ / ओ
  0x14: 'au',  // ઔ / औ

  // Consonants
  0x15: 'k',   // ક / क
  0x16: 'kh',  // ખ / ख
  0x17: 'g',   // ગ / ग
  0x18: 'gh',  // ઘ / घ
  0x19: 'ng',  // ઙ / ङ
  0x1a: 'ch',  // ચ / च
  0x1b: 'chh', // છ / छ
  0x1c: 'j',   // જ / ज
  0x1d: 'jh',  // ઝ / झ
  0x1e: 'ny',  // ઞ / ञ
  0x1f: 't',   // ટ / ट
  0x20: 'th',  // ઠ / ठ
  0x21: 'd',   // ડ / ड
  0x22: 'dh',  // ઢ / ढ
  0x23: 'n',   // ણ / ण
  0x24: 't',   // ત / त
  0x25: 'th',  // થ / थ
  0x26: 'd',   // દ / द
  0x27: 'dh',  // ધ / ध
  0x28: 'n',   // ન / न
  0x2a: 'p',   // પ / प
  0x2b: 'ph',  // ફ / फ
  0x2c: 'b',   // બ / ब
  0x2d: 'bh',  // ભ / भ
  0x2e: 'm',   // મ / म
  0x2f: 'y',   // ય / य
  0x30: 'r',   // ર / र
  0x32: 'l',   // લ / ल
  0x33: 'l',   // ળ / ळ
  0x35: 'v',   // વ / व
  0x36: 'sh',  // શ / श
  0x37: 'sh',  // ષ / ष
  0x38: 's',   // સ / स
  0x39: 'h',   // હ / ह

  // Vowel signs (Matras)
  0x3e: 'aa',  // ા / ा
  0x3f: 'i',   // િ / ि
  0x40: 'ee',  // ી / ी
  0x41: 'u',   // ુ / ु
  0x42: 'oo',  // ૂ / ू
  0x43: 'ri',  // ૃ / ृ
  0x47: 'e',   // ે / े
  0x48: 'ai',  // ૈ / ै
  0x4b: 'o',   // ો / ो
  0x4c: 'au',  // ૌ / ौ
  
  // Others
  0x02: 'n',   // ં / ं (anusvara)
  0x03: 'h',   // ઃ / ः (visarga)
};

/**
 * 1. Automatically transliterate Gujarati/Devanagari (Hindi) strings to phonetic English.
 */
export function transliterateIndicToEnglish(text) {
  if (!text) return '';
  
  let result = '';
  const len = text.length;
  
  for (let i = 0; i < len; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);
    
    // Check if character is inside Devanagari (0x0900 - 0x097F) or Gujarati (0x0A80 - 0x0AFF)
    const isDevanagari = (code >= 0x0900 && code <= 0x097F);
    const isGujarati = (code >= 0x0A80 && code <= 0x0AFF);
    
    if (isDevanagari || isGujarati) {
      const scriptBlockStart = isDevanagari ? 0x0900 : 0x0A80;
      const offset = code - scriptBlockStart;
      
      // Is it a consonant? (Offsets 0x15 to 0x39)
      const isConsonant = (offset >= 0x15 && offset <= 0x39);
      
      const roman = offsetMap[offset];
      
      if (roman) {
        result += roman;
        
        if (isConsonant) {
          // Look ahead to check for halant (virama) or matras
          let nextOffset = -1;
          if (i + 1 < len) {
            const nextCode = text.charCodeAt(i + 1);
            nextOffset = nextCode - scriptBlockStart;
          }
          
          // Halant (virama) is offset 0x4d (્ / ्)
          const isNextHalant = (nextOffset === 0x4d);
          
          // Is next char a vowel sign (matra) or special character?
          const isNextMatra = (nextOffset >= 0x3e && nextOffset <= 0x4c) || nextOffset === 0x02 || nextOffset === 0x03;
          
          if (isNextHalant) {
            // Skip the short 'a' vowel, and we will skip the halant character in the next iteration
            i++; 
          } else if (isNextMatra) {
            // Vowel will be mapped by the matra itself, so don't append default 'a'
          } else {
            // Default short 'a' sound for fully voiced consonants (if not followed by another consonant with virama or at absolute end of word)
            const isEndOfWord = (i + 1 === len || text[i + 1] === ' ' || text[i + 1] === '-' || text[i + 1] === '/');
            if (!isEndOfWord) {
              result += 'a';
            }
          }
        }
      } else {
        // Skip halant character itself if bypassed
        if (offset !== 0x4d) {
          result += char;
        }
      }
    } else {
      result += char;
    }
  }
  
  // Clean up double vowels or formatting quirks beautifully
  return result
    .replace(/aaa/g, 'aa')
    .replace(/eee/g, 'ee')
    .replace(/ooo/g, 'oo')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 2. Fetch live Google Input Tools Transliteration suggestions
 */
export async function fetchGoogleTransliteration(text, lang) {
  if (!text || !/[a-zA-Z]/.test(text)) return [];
  const itc = lang === 'Hindi' ? 'hi-t-i0-und' : 'gu-t-i0-und';
  try {
    const res = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${itc}&num=5&cp=0&cs=1&ie=utf-8&oe=utf-8&app=test`);
    const json = await res.json();
    if (json && json[0] === 'SUCCESS' && json[1] && json[1][0] && json[1][0][1]) {
      return json[1][0][1];
    }
  } catch (err) {
    console.error("Google transliteration failed:", err);
  }
  return [];
}

/**
 * 3. Quick script detection utility.
 */
export function hasIndicCharacters(text) {
  if (!text) return false;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if ((code >= 0x0900 && code <= 0x097F) || (code >= 0x0A80 && code <= 0x0AFF)) {
      return true;
    }
  }
  return false;
}
