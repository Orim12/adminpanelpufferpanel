import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/db';

export const POST: RequestHandler = async ({ request }) => {
  const data = await request.json();
  // { user, filename, link }
  if (!data.user || !data.filename || !data.link) {
    return json({ error: 'Missing fields' }, { status: 400 });
  }
  const db = await getDb();
  await db.collection('submissions').insertOne({
    user: data.user,
    filename: data.filename,
    link: data.link,
    status: 'pending',
    createdAt: new Date()
  });
  return json({ success: true });
};
