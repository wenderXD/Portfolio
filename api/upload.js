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

  const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'html', 'mp4', 'webm', 'mov', 'ogg'];
  if (!allowed.includes(safeExt)) {
    return res.status(400).json({ error: 'Unsupported file type. Allowed: ' + allowed.join(', ') });
  }

  const videoExts = ['mp4', 'webm', 'mov', 'ogg'];
  const isVideo = videoExts.includes(safeExt);

  try {
    const buf = await readBody(req);
    if (!buf || !buf.length) return res.status(400).json({ error: 'empty body' });
    const maxBytes = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (buf.length > maxBytes) {
      return res.status(413).json({ error: 'file too large (' + (isVideo ? '100MB' : '10MB') + ' max)' });
    }

    const folder = safeExt === 'html' ? 'prototypes' : (isVideo ? 'videos' : 'images');
    const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${safeExt}`;
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
