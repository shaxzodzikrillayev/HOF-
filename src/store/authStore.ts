import { create } from 'zustand';

/**
 * Admin authentication.
 *
 * The password itself is never stored in the frontend: the build only knows a
 * SHA-256 hash (VITE_ADMIN_PASSWORD_HASH from .env). At sign-in the entered
 * password is hashed with the Web Crypto API and compared against that hash,
 * so the original password cannot be recovered from the JavaScript bundle.
 * The session flag lives in sessionStorage and disappears when the tab closes.
 */

const SESSION_KEY = 'hofe:admin-session';

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

async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: readSession(),

  signIn: async (password) => {
    const expectedHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;
    let ok = false;
    if (expectedHash && password.length > 0) {
      try {
        ok = (await sha256Hex(password)) === expectedHash.toLowerCase();
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
