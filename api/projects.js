import { put, list } from '@vercel/blob';

const BLOB_NAME = 'projects.json';

async function readProjects() {
  const { blobs } = await list({ prefix: BLOB_NAME, limit: 10 });
  const file = blobs.find((b) => b.pathname === BLOB_NAME);
  if (!file) return [];
  const r = await fetch(file.url, { cache: 'no-store' });
  if (!r.ok) return [];
  try {
    const data = await r.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const arr = await readProjects();
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(200).json(arr);
    } catch (err) {
      return res.status(500).json({ error: String(err && err.message || err) });
    }
  }

  if (req.method === 'POST') {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return res.status(500).json({ error: 'ADMIN_PASSWORD not configured' });

    const body = req.body || {};
    if (body.password !== expected) return res.status(401).json({ error: 'unauthorized' });

    const projects = body.projects;
    if (!Array.isArray(projects)) return res.status(400).json({ error: 'projects must be an array' });

    try {
      await put(BLOB_NAME, JSON.stringify(projects), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 0,
      });
      return res.status(200).json({ ok: true, count: projects.length });
    } catch (err) {
      return res.status(500).json({ error: String(err && err.message || err) });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end();
}
