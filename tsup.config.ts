import { defineConfig } from 'tsup';

export default defineConfig([
    // Build du core (inclut l'IIFE)
    {
        entry: { index: 'src/index.ts' },
        format: ['esm', 'cjs', 'iife'],
        globalName: 'PouletMetrics', // IIFE global
        sourcemap: true,
        clean: true,
        dts: true,
        minify: true,
        target: 'es2018',
        splitting: false,
        // Rien d'externe ici (pas de react dans le core)
    },

    // Build de l'adapter React (sans IIFE)
    {
        entry: { react: 'src/react.tsx' },
        format: ['esm', 'cjs'],
        sourcemap: true,
        clean: false,
        dts: true,
        minify: true,
        target: 'es2018',
        splitting: false,
        external: ['react', 'react/jsx-runtime'], // <-- clé
    },
]);
