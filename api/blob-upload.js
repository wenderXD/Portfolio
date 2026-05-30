import { handleUpload } from '@vercel/blob/client';

// Client-side (direct browser → Blob) upload handler. Used for large files
// like videos that exceed the ~4.5MB serverless function request-body limit.
// The browser asks this route for a short-lived client token, then uploads
// straight to Vercel Blob storage — the bytes never pass through this function.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end();
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return res.status(500).json({ error: 'ADMIN_PASSWORD not configured' });

  try {
    const jsonResponse = await handleUpload({
      request: req,
      body: req.body,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // The admin password is passed as clientPayload (over HTTPS) for auth.
        if (!clientPayload || clientPayload !== expected) {
          throw new Error('unauthorized');
        }
        return {
          allowedContentTypes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'],
          maximumSizeInBytes: 200 * 1024 * 1024, // 200MB
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // No post-processing needed; the client receives the blob URL directly.
      },
    });
    return res.status(200).json(jsonResponse);
  } catch (err) {
    return res.status(400).json({ error: String((err && err.message) || err) });
  }
}
