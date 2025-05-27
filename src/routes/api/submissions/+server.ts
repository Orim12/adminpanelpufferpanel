import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/db';

export const GET: RequestHandler = async () => {
  const db = await getDb();
  const submissions = await db.collection('submissions').find().toArray();
  return json(submissions);
};

export const PATCH: RequestHandler = async ({ request }) => {
  const { id, status } = await request.json();
  if (!id || !status) return json({ error: 'Missing fields' }, { status: 400 });
  const db = await getDb();
  await db.collection('submissions').updateOne({ _id: new (await import('mongodb')).ObjectId(id) }, { $set: { status } });
  return json({ success: true });
};
