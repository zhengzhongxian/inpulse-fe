import CryptoJS from 'crypto-js';

const AES_KEY = import.meta.env.VITE_AES_KEY || '';
const AES_IV = import.meta.env.VITE_AES_IV || '';

/**
 * Giải mã chuỗi đã được mã hoá AES/CBC/PKCS5 ở backend Java.
 * Trả về chuỗi gốc, hoặc fallback nếu giải mã thất bại.
 */
export function decryptAes(cipherText: string, fallback: string = ''): string {
  if (!cipherText || !AES_KEY || !AES_IV) return fallback;
  try {
    const key = CryptoJS.enc.Base64.parse(AES_KEY);
    const iv = CryptoJS.enc.Base64.parse(AES_IV);
    const decrypted = CryptoJS.AES.decrypt(cipherText, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    return decrypted.toString(CryptoJS.enc.Utf8) || fallback;
  } catch {
    return fallback;
  }
}
