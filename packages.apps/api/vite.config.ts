import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    ssr: true,
    target: 'node22',
    rollupOptions: {
      input: resolve(__dirname, 'src/index.ts'),
      output: {
        entryFileNames: 'index.js',
      },
    },
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@agentic/system.logging': resolve(
        __dirname,
        '../../packages.lib/system.logging/src/index.ts',
      ),
    },
  },
});
