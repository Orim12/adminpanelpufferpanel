import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/db';

export const POST: RequestHandler = async ({ request }) => {
  const { username, password } = await request.json();
  const db = await getDb();
  const user = await db.collection('users').findOne({ username });

  if (!user || user.password !== password) {
    return json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // In production, use JWT or session cookies
  return json({ user: { username: user.username, role: user.role } });
};
