import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isTest = process.env.VITEST;
const isProd = process.env.NODE_ENV === 'production'
const root = process.cwd();

const resolve = (_path) => path.resolve(__dirname, _path);

const indexProd = isProd
    ? fs.readFileSync(resolve('./public/index.html'), 'utf-8')
    : ''

const createServer = async () => {

    const app = express();

    let vite;

    if (!isProd) {
        vite = await (await import('vite')).createServer({
            root,
            logLevel: isTest ? 'error' : 'info',
            server: {
                middlewareMode: true,
                watch: {
                    usePolling: true,
                    interval: 100
                }
            },
            appType: "custom"
        })

        app.use(vite.middlewares)
    }

    if (isProd) {
        app.use(
            (await import ('compression')).default()
        )

        app.use(
            (await import('serve-static')).default(resolve('/'), {
                index: false
            })
        )
    }

    // api routes

    app.use('*', async (req, res) => {
        try {

            const url = req.originalUrl;

            let template, render;

            if (!isProd) {
                template = fs.readFileSync(resolve('./public/index.html'), 'utf8')
                template = await vite.transformIndexHtml(url, template)

                render = (await vite.ssrLoadModule('./src/entry-server.jsx')).default.render;
            }

            if (isProd) {
                template = indexProd;

                render = (await import('./src/entry-server.jsx')).default.render;
            }

            const context = {};
            const appHtml = render(url, context)

            if (context.url) return res.redirect(301, context.url);

            const html = template.replace('<!--app-html-->', appHtml.html)

            res.status(200).set({ "Content-Type": "text/html" }).end(html)

        } catch (e) {
            !isProd && vite.ssrFixStacktrace(e)
            console.log(e.stack)
            res.status(500).end(e.stack)
        }
    })

    return { app, vite }
}

if (!isTest) {
    createServer().then(({ app }) => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`Server running on http://localhost:${process.env.PORT || 3000}`);
        })
    })
}