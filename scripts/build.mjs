// Explicit allowlist prevents documentation, configuration, and secrets from reaching Pages.
import { rm, mkdir, copyFile, cp } from 'node:fs/promises';
await rm('dist', { recursive:true, force:true });
await mkdir('dist', { recursive:true });
for (const name of ['index.html','style.css','script.js','.nojekyll']) await copyFile(name, `dist/${name}`);
await cp('assets', 'dist/assets', { recursive:true });
console.log('Built static files in dist/. No backend or personal data included.');
