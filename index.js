'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { pipeline } = require('node:stream');
const ROOT = fs.realpathSync(__dirname);
const ROUTES = new Map([
  ['/', 'index.html'], ['/index.html', 'index.html'],
  ['/discord', 'discord.html'], ['/discord.html', 'discord.html'],
  ['/ig', 'ig.html'], ['/ig.html', 'ig.html'],
  ['/style.css', 'style.css'], ['/app.js', 'app.js']
]);
const TYPES = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.png':'image/png', '.ttf':'font/ttf', '.txt':'text/plain; charset=utf-8' };
const POLICY = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'";
function reply(res, status, message, head = false) {
  const body = Buffer.from(message);
  res.writeHead(status, { 'Content-Type':'text/plain; charset=utf-8', 'Content-Length':body.length, 'Cache-Control':'no-store' });
  res.end(head ? undefined : body);
}
function createServer() {
  return http.createServer((req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Content-Security-Policy', POLICY);
    if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); reply(res, 405, 'Méthode non autorisée.'); return; }
    const head = req.method === 'HEAD';
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { reply(res, 400, 'Adresse invalide.', head); return; }
    if (pathname === '/healthz') {
      const body = JSON.stringify({ status:'ok' });
      res.writeHead(200, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store' });
      res.end(head ? undefined : body); return;
    }
    let relative = ROUTES.get(pathname);
    // Public resources only. Server files, .git, configuration and build tools are never served.
    if (!relative && /^\/assets\/[A-Za-z0-9_-]+\.(png|ttf|txt)$/.test(pathname)) relative = pathname.slice(1);
    if (!relative) { reply(res, 404, 'Page introuvable. Retourne à l’accueil du site.', head); return; }
    const file = path.join(ROOT, relative);
    fs.realpath(file, (realError, realFile) => {
      if (realError || realFile !== file) { reply(res, 404, 'Fichier introuvable.', head); return; }
      fs.stat(realFile, (error, stat) => {
        if (error || !stat.isFile()) { reply(res, 404, 'Fichier introuvable.', head); return; }
        const etag = `W/"${stat.size.toString(16)}-${Math.trunc(stat.mtimeMs).toString(16)}"`;
        res.setHeader('ETag', etag);
        res.setHeader('Cache-Control', relative.endsWith('.html') ? 'no-cache' : 'public, max-age=3600');
        if (req.headers['if-none-match'] === etag) { res.writeHead(304); res.end(); return; }
        res.setHeader('Content-Type', TYPES[path.extname(relative)] || 'application/octet-stream');
        res.setHeader('Content-Length', stat.size);
        if (head) { res.writeHead(200); res.end(); return; }
        const stream = fs.createReadStream(realFile);
        stream.once('error', () => { if (!res.headersSent) { res.removeHeader('Content-Length'); reply(res, 500, 'Lecture du fichier impossible.'); } });
        pipeline(stream, res, () => {});
      });
    });
  });
}
if (require.main === module) {
  const port = Number(process.env.PORT || process.env.SERVER_PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) { console.error('PORT ou SERVER_PORT doit être un nombre entre 1 et 65535.'); process.exit(1); }
  const server = createServer();
  server.on('error', error => { console.error(`Démarrage impossible : ${error.code || error.message}`); process.exitCode = 1; });
  server.listen(port, '0.0.0.0', () => console.log(`Strada Reload — site démarré sur 0.0.0.0:${port}`));
  for (const signal of ['SIGTERM', 'SIGINT']) process.once(signal, () => {
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  });
}
module.exports = { createServer };
