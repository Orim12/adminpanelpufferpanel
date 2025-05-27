import type { RequestHandler } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { getDb } from '$lib/db';

export const POST: RequestHandler = async ({ request }) => {
  const { username, password } = await request.json();
  if (!username || !password) {
    return json({ error: 'Gebruikersnaam en wachtwoord verplicht' }, { status: 400 });
  }
  const db = await getDb();
  const existing = await db.collection('users').findOne({ username });
  if (existing) {
    return json({ error: 'Gebruikersnaam bestaat al' }, { status: 409 });
  }
  await db.collection('users').insertOne({ username, password, role: 'user' });
  return json({ success: true });
};
