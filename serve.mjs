import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.md': 'text/plain',
  '.yml': 'text/plain',
  '.yaml': 'text/plain',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const server = createServer(async (req, res) => {
  let path = req.url === '/' ? '/templates/cv-template.html' : decodeURIComponent(req.url);
  const filePath = join(__dirname, path);
  try {
    const data = await readFile(filePath);
    const ext = extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Serving on http://localhost:${port}`));
