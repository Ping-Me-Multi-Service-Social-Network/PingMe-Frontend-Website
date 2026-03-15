/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BACKEND_BASE_URL: string;
  readonly VITE_MUSIC_SERVICE_BASE_URL: string;
  readonly VITE_AUTH_SERVICE_BASE_URL: string;

  readonly VITE_ZEGO_APP_ID: string;
  readonly VITE_ZEGO_SERVER_SECRET: string;

  readonly VITE_TURNSTILE_SITE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
