import { defineConfig, loadEnv } from 'vite';

// Build separado del widget embebible: sin React/Ant Design, bundle único IIFE.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
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
    // La URL y la anon key de Supabase quedan hardcodeadas dentro del
    // bundle del widget en tiempo de build — el snippet que un negocio
    // pega en su sitio nunca las expone en el HTML, solo trae data-bot-id.
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
  };
});
