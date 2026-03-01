import express from 'express';
import { readFile, writeFile } from 'fs/promises';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'src', 'data');

const app = express();
app.use(express.json());

// Serve the CMS UI (index.html, style.css, app.js)
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

// Allowed file names (whitelist for security)
const ALLOWED_FILES = new Set(['gigs', 'videos', 'songs', 'members']);

// GET /api/:file — read JSON file
app.get('/api/:file', async (req, res) => {
    const { file } = req.params;
    if (!ALLOWED_FILES.has(file)) {
        return res.status(404).json({ error: 'Not found' });
    }
    try {
        const raw = await readFile(join(DATA_DIR, `${file}.json`), 'utf-8');
        res.json(JSON.parse(raw));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/:file — write JSON file
app.put('/api/:file', async (req, res) => {
    const { file } = req.params;
    if (!ALLOWED_FILES.has(file)) {
        return res.status(404).json({ error: 'Not found' });
    }
    try {
        const json = JSON.stringify(req.body, null, 4);
        await writeFile(join(DATA_DIR, `${file}.json`), json + '\n', 'utf-8');
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/publish — git add + commit + push, streams output via SSE
app.post('/api/publish', (req, res) => {
    const message = req.body?.message || 'chore: update content';

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const send = (text) => res.write(`data: ${text}\n\n`);

    // Use spawn with explicit args — never interpolate user input into a shell string
    const steps = [
        ['git', ['-C', ROOT, 'add', 'src/data']],
        ['git', ['-C', ROOT, 'commit', '-m', message]],
        ['git', ['-C', ROOT, 'push']],
    ];

    function runStep(i) {
        if (i >= steps.length) {
            send('✓ Published successfully.');
            res.write('data: __DONE__\n\n');
            res.end();
            return;
        }
        const [cmd, args] = steps[i];
        send(`> ${cmd} ${args.join(' ')}`);
        const child = spawn(cmd, args);
        const pipe = (d) =>
            d
                .toString()
                .split('\n')
                .forEach((line) => line && send(line));
        child.stdout.on('data', pipe);
        child.stderr.on('data', pipe);
        child.on('close', (code) => {
            if (code !== 0) {
                send(`✗ Exited with code ${code}`);
                res.write('data: __DONE__\n\n');
                res.end();
                return;
            }
            runStep(i + 1);
        });
    }

    runStep(0);
});

const PORT = 4322;
app.listen(PORT, () => {
    console.log(`CMS running at http://localhost:${PORT}`);
});
