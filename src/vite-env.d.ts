/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** SHA-256 hex hash of the admin password. The plain password is never stored in the frontend. */
  readonly VITE_ADMIN_PASSWORD_HASH?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
