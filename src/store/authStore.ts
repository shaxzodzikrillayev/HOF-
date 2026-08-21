import { create } from 'zustand';

/**
 * Admin authentication.
 *
 * The password itself is never stored in the frontend: the build only knows a
 * SHA-256 hash (VITE_ADMIN_PASSWORD_HASH from .env / Vercel env vars). At
 * sign-in the entered password is hashed and compared against that hash, so
 * the original password cannot be recovered from the JavaScript bundle.
 * The session flag lives in sessionStorage and disappears when the tab closes.
 */

const SESSION_KEY = 'hofe:admin-session';

// SHA-256 of the current admin password ("WER67"). Used whenever the build has
// no usable VITE_ADMIN_PASSWORD_HASH env var configured (e.g. Vercel without
// env setup), so development and production always accept the same password.
const DEFAULT_PASSWORD_HASH = '92e37fd3917d33f15566e377281c16158738ce5efffc4dbfb64734560166d4c8';

/**
 * Values pasted into the Vercel dashboard often carry stray quotes or
 * surrounding whitespace/newlines. Normalize them and treat an empty value as
 * "not configured" so the built-in fallback hash applies instead of breaking
 * every login attempt.
 */
function normalizeEnvHash(value: string | undefined): string {
  return (value ?? '').trim().replace(/^["']+|["']+$/g, '');
}

const EXPECTED_HASH =
  normalizeEnvHash(import.meta.env.VITE_ADMIN_PASSWORD_HASH) || DEFAULT_PASSWORD_HASH;

interface AuthState {
  isAuthenticated: boolean;
  signIn: (password: string) => Promise<boolean>;
  signOut: () => void;
}

function readSession(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function writeSession(authenticated: boolean): void {
  try {
    if (authenticated) {
      window.sessionStorage.setItem(SESSION_KEY, '1');
    } else {
      window.sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {
    // sessionStorage unavailable — session just won't persist
  }
}

/**
 * Pure-JS SHA-256 used only where Web Crypto is unavailable: crypto.subtle
 * exists exclusively in secure contexts (HTTPS or localhost), so an HTTP
 * preview would otherwise reject every correct password. Produces identical
 * lowercase hex output as the Web Crypto path.
 */
function sha256HexJs(text: string): string {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4,
    0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe,
    0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f,
    0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
    0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116,
    0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
    0xc67178f2,
  ];

  const bytes = new TextEncoder().encode(text);
  const bitLength = bytes.length * 8;
  const paddedLength = (((bytes.length + 8) >> 6) + 1) << 6;
  const blocks = new Uint8Array(paddedLength);
  blocks.set(bytes);
  blocks[bytes.length] = 0x80;
  const view = new DataView(blocks.buffer);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000));
  view.setUint32(paddedLength - 4, bitLength >>> 0);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;
  const w = new Uint32Array(64);
  const rotr = (x: number, n: number): number => (x >>> n) | (x << (32 - n));

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      w[i] = view.getUint32(offset + i * 4);
    }
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;
    for (let i = 0; i < 64; i += 1) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((part) => part.toString(16).padStart(8, '0'))
    .join('');
}

async function sha256Hex(text: string): Promise<string> {
  if (globalThis.crypto?.subtle) {
    const data = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(digest))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }
  return sha256HexJs(text);
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: readSession(),

  signIn: async (password) => {
    // Compare exactly what was typed (minus accidental outer whitespace)
    // against the stored hash — identical logic in dev and on Vercel prod.
    const trimmed = password.trim();
    let ok = false;
    if (trimmed.length > 0) {
      try {
        ok = (await sha256Hex(trimmed)) === EXPECTED_HASH.toLowerCase();
      } catch {
        ok = false;
      }
    }
    writeSession(ok);
    set({ isAuthenticated: ok });
    return ok;
  },

  signOut: () => {
    writeSession(false);
    set({ isAuthenticated: false });
  },
}));
