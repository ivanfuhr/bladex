import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        include: ['packages/bladex/tests/**/*.test.js'],
        setupFiles: ['packages/bladex/tests/setup.js'],
    },
});
