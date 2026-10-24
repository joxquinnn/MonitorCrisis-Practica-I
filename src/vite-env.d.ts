/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_TB_URL?: string;
  readonly VITE_TB_WS_URL?: string;
  readonly VITE_TB_USERNAME?: string;
  readonly VITE_TB_PASSWORD?: string;
  readonly VITE_TB_DEVICE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
