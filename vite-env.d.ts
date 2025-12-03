/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  // لو عندك متغيرات تانية ضيفها هنا بنفس الشكل
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
