/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ISSUER_TEMPLATE_ID?: string;
  readonly VITE_ISSUER_ORG_CODE?: string;
  readonly VITE_ISSUER_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
