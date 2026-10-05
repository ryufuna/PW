import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('../public/', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
export function createServer({ basePath = '/' } = {}) {
  if (!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(basePath)) throw new Error('Invalid preview base path');
  return http.createServer(async (req, res) => {
    try {
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
      let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      if (basePath !== '/' && pathname === basePath.slice(0, -1)) { res.writeHead(301, { Location: basePath }); return res.end(); }
      if (!pathname.startsWith(basePath)) { res.writeHead(404); return res.end('Not found'); }
      pathname = '/' + pathname.slice(basePath.length);
      const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(root + path.sep) || !types[path.extname(file)]) { res.writeHead(404); return res.end('Not found'); }
      const data = await readFile(file);
      res.writeHead(200, { 'Content-Type': types[path.extname(file)], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch { res.writeHead(404); res.end('Not found'); }
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  const basePath = process.env.PW_BASE_PATH || '/';
  createServer({ basePath }).listen(port, '127.0.0.1', () => console.log(`PW preview: http://127.0.0.1:${port}${basePath}`));
}
