// lib/cardFile.ts
const MAX_BYTES = 4 * 1024 * 1024
export const UNSUPPORTED_FORMAT = 'Formato non supportato (usa PNG, JPG o WEBP)'
const EXT_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

// L'estensione deriva dal MIME validato, mai dal nome file scelto dall'utente.
export function cardExtension(type: string): string | null {
  return EXT_BY_TYPE[type] ?? null
}

export function cardFileError(f: { type: string; size: number }): string | null {
  if (f.size === 0) return 'Nessun file selezionato'
  if (!cardExtension(f.type)) return UNSUPPORTED_FORMAT
  if (f.size > MAX_BYTES) return 'File troppo grande (max 4 MB)'
  return null
}

// Tipo reale dedotto dai primi byte, per non fidarsi del MIME dichiarato dal client.
export function sniffImageType(b: Uint8Array): string | null {
  const at = (i: number, sig: number[]) => sig.every((v, k) => b[i + k] === v)
  if (at(0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return 'image/png'
  if (at(0, [0xff, 0xd8, 0xff])) return 'image/jpeg'
  if (at(0, [0x52, 0x49, 0x46, 0x46]) && at(8, [0x57, 0x45, 0x42, 0x50])) return 'image/webp'
  return null
}
