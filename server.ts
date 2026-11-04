// Servidor do Sementinha. Mesmo desenho do joaopaulooliveira.com: Express em Node.
// No build, o esbuild gera dist-server/server.cjs, que a Hostinger abre pelo server.cjs da raiz.
import express from 'express';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const ROOT_DIR = process.cwd();
const PORT = Number(process.env.PORT || 3100);
// Modo de desenvolvimento só pelo `npm run dev` (que passa --dev).
const emDesenvolvimento = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';

const app = express();
app.set('trust proxy', 1);

// Cabeçalhos de proteção. É app de criança: nada de fora carrega, só os vídeos do YouTube sem cookies.
// A lista (CSP) só vale publicado; no computador fica desligada por causa do Vite.
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: emDesenvolvimento
      ? false
      : {
          directives: {
            'default-src': ["'self'"],
            'img-src': ["'self'", 'data:', 'https://i.ytimg.com'],
            'frame-src': ['https://www.youtube-nocookie.com'],
            'style-src': ["'self'", "'unsafe-inline'"],
            'script-src': ["'self'"],
            'font-src': ["'self'"],
            'connect-src': ["'self'"],
          },
        },
  }),
);

// Log curto: só o caminho, nunca o que vem depois do "?".
app.use((req, _res, next) => {
  if (req.path.startsWith('/api')) console.log(`${req.method} ${req.path}`);
  next();
});

app.get('/api/health', (_req, res) => {
  res.set('Cache-Control', 'no-store').json({ ok: true });
});

async function iniciar() {
  const distPath = path.join(ROOT_DIR, 'dist');

  if (emDesenvolvimento) {
    // No computador: o Vite monta as telas na hora e atualiza sozinho.
    const { createServer } = await import('vite');
    const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
    app.use(vite.middlewares);
    app.get('*', async (req, res, next) => {
      try {
        const modelo = fs.readFileSync(path.resolve(ROOT_DIR, 'index.html'), 'utf-8');
        const html = await vite.transformIndexHtml(req.originalUrl, modelo);
        res.status(200).type('html').end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    // Publicado: /assets tem código no nome do arquivo, pode ficar guardado por muito tempo.
    app.use('/assets', express.static(path.join(distPath, 'assets'), { immutable: true, maxAge: '1y' }));
    app.use('/assets', (_req, res) => {
      res.status(404).set('Cache-Control', 'no-store').type('text/plain').send('Arquivo não encontrado');
    });
    app.use(express.static(distPath, { index: false, setHeaders: (res) => res.setHeader('Cache-Control', 'no-cache') }));
    app.get('*', (req, res) => {
      if (/\.[a-z0-9]{1,8}$/i.test(req.path)) {
        return res.status(404).set('Cache-Control', 'no-cache').type('text/plain').send('Arquivo não encontrado');
      }
      res.set('Cache-Control', 'no-cache').sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sementinha rodando na porta ${PORT}`);
  });
}

iniciar();
