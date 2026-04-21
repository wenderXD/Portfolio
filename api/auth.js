export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return res.status(500).json({ error: 'ADMIN_PASSWORD not configured' });
  }
  const provided = (req.body && req.body.password) || '';
  if (provided !== expected) {
    return res.status(401).json({ error: 'invalid' });
  }
  return res.status(200).json({ ok: true });
}
