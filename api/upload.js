import { put } from '@vercel/blob';

// Raw binary upload — skip Vercel's default body parser.
export const config = {
  api: { bodyParser: false },
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return res.status(500).json({ error: 'ADMIN_PASSWORD not configured' });

  const provided = req.headers['x-admin-password'] || '';
  if (provided !== expected) return res.status(401).json({ error: 'unauthorized' });

  const contentType = req.headers['content-type'] || 'application/octet-stream';
  const extQuery = (req.query && req.query.ext) || '';
  const safeExt = String(extQuery).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 6) || 'bin';

  try {
    const buf = await readBody(req);
    if (!buf || !buf.length) return res.status(400).json({ error: 'empty body' });
    if (buf.length > 10 * 1024 * 1024) return res.status(413).json({ error: 'file too large (10MB max)' });

    const name = `images/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;
    const blob = await put(name, buf, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
    });
    return res.status(200).json({ url: blob.url });
  } catch (err) {
    return res.status(500).json({ error: String(err && err.message || err) });
  }
}
