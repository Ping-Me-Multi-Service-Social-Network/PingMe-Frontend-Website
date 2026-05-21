export function fnv1a32Hex(input: string): string {
  // Stable, non-cryptographic hash just to distinguish values without exposing content.
  // Reference: FNV-1a 32-bit.
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

