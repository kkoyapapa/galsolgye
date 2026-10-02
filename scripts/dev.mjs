// Local preview only; not part of the deployed website.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root = process.cwd();
const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const port = Number(portIndex >= 0 ? args[portIndex + 1] : process.env.PORT || 4173);
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'application/javascript; charset=utf-8', '.jpg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    let name = decodeURIComponent(url.pathname).replace(/^\/galsolgye(?=\/|$)/, '');
    if (name === '/' || name === '') name = '/index.html';
    const file = path.resolve(root, '.' + name);
    const publicFile = ['index.html','style.css','script.js','qa-mobile.html'].includes(name.slice(1)) || name.startsWith('/assets/');
    if (!publicFile || !file.startsWith(root + path.sep)) { res.writeHead(404); res.end('Not found'); return; }
    const body = await fs.readFile(file);
    res.writeHead(200, { 'Content-Type':types[path.extname(file)] || 'application/octet-stream', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' });
    res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(port, '0.0.0.0', () => console.log(`Preview server ready on port ${port}`));
