import { defineConfig } from 'vite';

// Build separado del widget embebible: sin React/Ant Design, bundle único IIFE.
export default defineConfig({
  build: {
    outDir: 'dist/widget',
    emptyOutDir: true,
    lib: {
      entry: 'src/widget/index.ts',
      name: 'SaasChatbotIAWidget',
      formats: ['iife'],
      fileName: () => 'widget.js',
    },
  },
});
