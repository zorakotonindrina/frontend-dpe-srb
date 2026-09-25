export async function sha1(value: string): Promise<string> {
  const bytes  = new TextEncoder().encode(value);
  const buffer = await crypto.subtle.digest('SHA-1', bytes);

  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}
