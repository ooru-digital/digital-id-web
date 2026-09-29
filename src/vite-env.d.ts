/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CREDISSUER_API_TOKEN?: string;  readonly VITE_CREDISSUER_TEMPLATE_ID?: string;
  readonly VITE_CREDISSUER_ORG_CODE?: string;
  readonly VITE_CREDISSUER_ISSUER_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
