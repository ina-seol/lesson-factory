import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  base:'/lesson-factory/',
  plugins:[react()],
  publicDir:false,
  build:{outDir:'site-pages',assetsDir:'pages-assets',rollupOptions:{input:'web/index.html'}},
});
