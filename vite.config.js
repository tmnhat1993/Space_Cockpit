import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Dev: base '/' (giữ như cũ). Production: dùng VITE_BASE_PATH từ .env.production (vd /Space_Cockpit/dist/).
  const env = loadEnv(mode, process.cwd(), '');
  const base = mode === 'production' ? (env.VITE_BASE_PATH ?? '/') : '/';

  return {
  base,
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: 'index.html',
    },
  },
  css: {
    preprocessorOptions: {
      scss: {},
    },
  },
  };
});
