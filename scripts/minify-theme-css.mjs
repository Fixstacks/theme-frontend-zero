/**
 * Copyright © 2026 Roman Pasichnyk
 * SPDX-License-Identifier: OSL-3.0 OR AFL-3.0
 *
 * Minifies the hand-written web/css/theme-overrides.css of every Zero theme
 * in place, with lightningcss (Tailwind's own CSS engine). For the deploy
 * build only (npm run build:dist in buildspec.yml): the files in git stay
 * readable. A file lightningcss can't parse is left as it is, with a warning.
 *
 * Usage: node scripts/minify-theme-css.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transform } from 'lightningcss';

const themesDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

for (const theme of fs.readdirSync(themesDir)) {
    const file = path.join(themesDir, theme, 'web/css/theme-overrides.css');
    if (!fs.existsSync(file)) {
        continue;
    }
    const source = fs.readFileSync(file);
    try {
        const { code } = transform({ filename: file, code: source, minify: true });
        fs.writeFileSync(file, code);
        console.log(`${theme}/web/css/theme-overrides.css: ${source.length} → ${code.length} bytes`);
    } catch (error) {
        console.warn(`${theme}/web/css/theme-overrides.css left as it is: ${error.message}`);
    }
}
