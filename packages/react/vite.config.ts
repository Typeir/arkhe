/**
 * @fileoverview React port build: library mode, one module per
 * source file, every bare import external.
 *
 * @module packages/react/vite.config
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
    lib: { entry: { index: 'src/index.ts' }, formats: ['es'] },
    rolldownOptions: {
      external: (id) =>
        !id.startsWith('.') &&
        !id.startsWith('/') &&
        !/^[A-Za-z]:[\\/]/.test(id),
      output: { preserveModules: true, preserveModulesRoot: 'src' },
    },
  },
});
