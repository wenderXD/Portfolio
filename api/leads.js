import { put, list } from '@vercel/blob';

// Lead-magnet email capture. Public POST appends an email to leads.json in
// Vercel Blob; GET is admin-only (same ADMIN_PASSWORD as the rest of the API)
// so the captured list isn't readable by visitors.
const BLOB_NAME = 'leads.json';

async function readLeads() {
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

async function writeLeads(leads) {
  await put(BLOB_NAME, JSON.stringify(leads), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
    allowOverwrite: true,
    cacheControlMaxAge: 0,
  });
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  // ── Admin: list captured leads ──────────────────────────────
  if (req.method === 'GET') {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return res.status(500).json({ error: 'ADMIN_PASSWORD not configured' });
    const provided = req.headers['x-admin-password'] || (req.query && req.query.password) || '';
    if (provided !== expected) return res.status(401).json({ error: 'unauthorized' });
    try {
      const leads = await readLeads();
      res.setHeader('Cache-Control', 'no-store, max-age=0');
      return res.status(200).json({ count: leads.length, leads });
    } catch (err) {
      return res.status(500).json({ error: String((err && err.message) || err) });
    }
  }

  // ── Public: capture a lead ──────────────────────────────────
  if (req.method === 'POST') {
    const body = req.body || {};

    // Honeypot — bots fill hidden fields; humans leave them empty.
    if (body.company) return res.status(200).json({ ok: true });

    const email = String(body.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 254) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    const name = String(body.name || '').trim().slice(0, 120);
    const source = String(body.source || 'lead-page').trim().slice(0, 60);

    try {
      const leads = await readLeads();
      const existing = leads.find((l) => l.email === email);
      if (existing) {
        // Idempotent: already subscribed, treat as success.
        return res.status(200).json({ ok: true, duplicate: true });
      }
      leads.push({
        email,
        name,
        source,
        ts: new Date().toISOString(),
        ua: String(req.headers['user-agent'] || '').slice(0, 200),
      });
      await writeLeads(leads);
      return res.status(200).json({ ok: true, count: leads.length });
    } catch (err) {
      return res.status(500).json({ error: String((err && err.message) || err) });
    }
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).end();
}
