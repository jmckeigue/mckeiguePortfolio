import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
 
const app = express();
 
app.use(express.static(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '/src'), { index: false }));
 
app.use('*', async (_, res) => {
  try {
    const template = fs.readFileSync('./src/index.html', 'utf-8');
    const { render } = await import('./dist/server/entry-server.js');

    const { getServerData } = await import('./server/function.js');
    const data = await getServerData();
    const script = `<script>window.__data__=${JSON.stringify(data)}</script>`;
 
    const html = template.replace(`<!--app-html-->`, `${render(data)} ${script}`);
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
  } catch (error) {
    res.status(500).end(error);
  }
}); 
 
app.listen(5173, () => {
  console.log('http://localhost:5173.');
});