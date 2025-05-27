import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return Response.json({ error: 'E-mail en wachtwoord zijn verplicht.' }, { status: 400 })
  }
  const config = await configPromise
  const payload = await getPayload({ config })
  try {
    // Controleer of gebruiker al bestaat
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
    })
    if (existing.docs.length > 0) {
      return Response.json({ error: 'E-mail is al in gebruik.' }, { status: 400 })
    }
    // Maak gebruiker aan
    await payload.create({
      collection: 'users',
      data: { email, password, role: 'user' },
    })
    return Response.json({ success: true })
  } catch (e: any) {
    return Response.json({ error: e?.message || 'Er ging iets mis.' }, { status: 500 })
  }
}
