import * as esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const packageName = 'bladex';
const packageRoot = path.join(root, 'packages', packageName);
const distDir = path.join(packageRoot, 'dist');
const entry = path.join(packageRoot, 'builds', 'cdn.js');
const outfile = path.join(distDir, 'bladex.js');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

const watch = process.argv.includes('--watch');

const buildOptions = {
    entryPoints: [entry],
    outfile,
    bundle: true,
    platform: 'browser',
    format: 'iife',
    target: ['es2018'],
};

if (watch) {
    const context = await esbuild.context(buildOptions);
    await context.watch();
    console.log('Watching bladex.js...');
} else {
    await esbuild.build(buildOptions);
    console.log(`Built ${path.relative(root, outfile)}`);
}
