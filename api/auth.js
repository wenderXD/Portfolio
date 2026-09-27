import { isAdmin } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD not configured' });
  }
  if (!isAdmin(req.body && req.body.password)) {
    return res.status(401).json({ error: 'invalid' });
  }
  return res.status(200).json({ ok: true });
}
