/**
 * Decrypts AES-128-CBC encrypted base64 strings sent by the Laravel backend.
 * The backend prepends a 16-byte raw IV to the ciphertext and base64-encodes the result.
 * This function uses the native browser Web Crypto API (no external NPM packages needed).
 */
export async function decryptAES128(encryptedBase64) {
  if (!encryptedBase64) return '';
  try {
    // 1. Decode base64 to binary string, then Uint8Array
    const binaryString = atob(encryptedBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // 2. Extract IV (first 16 bytes) and Ciphertext
    if (bytes.length <= 16) return '';
    const iv = bytes.slice(0, 16);
    const ciphertext = bytes.slice(16);
    
    // 3. Import Key (16 bytes UTF-8 representing "aseEncriptionKey")
    const encoder = new TextEncoder();
    const keyBytes = encoder.encode("aseEncriptionKey");
    const cryptoKey = await window.crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );
    
    // 4. Decrypt using the native Web Crypto API
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-CBC", iv: iv },
      cryptoKey,
      ciphertext
    );
    
    // 5. Convert decrypted buffer to string
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err) {
    console.error("AES-128-CBC Decryption failed:", err);
    return encryptedBase64; // Fallback to raw string if decryption fails
  }
}
