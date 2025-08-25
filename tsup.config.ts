//tsup.config.ts

import { defineConfig } from 'tsup';

export default defineConfig([
    // Build du core (inclut l'IIFE)
    {
        entry: {
            index: 'src/index.ts',
            react: 'src/react.tsx'
        },
        format: ['esm', 'cjs', 'iife'],
        globalName: 'Poulet', // IIFE global
        platform: 'browser',
        treeshake: true,
        sourcemap: true,
        clean: true,
        external: ['express', 'cors', 'react'],
        dts: { entry: { index: 'src/index.ts', react: 'src/react.tsx' } },
        minify: true,
        target: 'es2018',
        splitting: false,
        outDir: 'dist',
    }
]);
