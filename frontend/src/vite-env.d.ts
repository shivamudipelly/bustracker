/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_URL: string;
  // Add other variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
