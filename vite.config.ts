import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Fix for process.cwd() TS error in config file
declare const process: { cwd: () => string; env: Record<string, string> };

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This ensures process.env.API_KEY works in the browser after Vercel build
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    }
  }
})