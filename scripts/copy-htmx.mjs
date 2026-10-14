#!/usr/bin/env node
/**
 * Copies htmx.org's own published dist build into this theme's static
 * web/js/ folder, so Magento's static-content pipeline serves it like
 * any other theme asset — no CDN dependency, no build-step surprises,
 * a real pinned version tracked via package.json/package-lock.json
 * like every other dependency this theme has.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const THEME_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(THEME_ROOT, 'node_modules/htmx.org/dist/htmx.min.js');
const DEST_DIR = join(THEME_ROOT, 'web/js');
const DEST = join(DEST_DIR, 'htmx.min.js');

if (!existsSync(SOURCE)) {
    console.error(`htmx.org dist build not found at ${SOURCE} — run "npm install" first.`);
    process.exit(1);
}

mkdirSync(DEST_DIR, { recursive: true });
copyFileSync(SOURCE, DEST);
console.log(`Copied htmx.min.js -> ${DEST}`);
