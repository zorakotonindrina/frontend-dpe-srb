const AES_KEY_IV = process.env.NEXT_PUBLIC_AES_KEY ?? '1234567890123456';

/**
 * Chiffre un texte en AES-128-CBC (PKCS7) avec la clé/IV de l'application.
 * Compatible avec CryptoJS.AES.encrypt(parsedText, parsedKey, { iv, mode: CBC, padding: Pkcs7 }).
 * Retourne le ciphertext encodé en Base64 (sans préfixe "Salted__").
 */
export async function encryptAES(plaintext: string): Promise<string> {
  const raw = new TextEncoder().encode(AES_KEY_IV);
  const key = await crypto.subtle.importKey('raw', raw, { name: 'AES-CBC' }, false, ['encrypt']);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: raw },
    key,
    new TextEncoder().encode(plaintext),
  );
  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}
