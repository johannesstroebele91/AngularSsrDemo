import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import { config } from 'dotenv-esm';

config(); // This will read the .env file and set environment variables

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  /* TODO fix later server.get('/api/secret', (req, res) => {
    console.log('/api/secret')
    // Fetch the secret from wherever it's stored
    const secret = process.env['SECRET']; // Or fetch it from a database, file, etc.

    // Return the secret as JSON
    res.json({ secret });
  });
*/

  // Example Express Rest API endpoints
  server.get('/api/**', (req, res) => { res.send('Hello!') });

  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));


  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  console.log('process.env.SECRET', process.env['SECRET']); // Log process.env here
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}



run();
