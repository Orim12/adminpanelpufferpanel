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
    // Login via Payload REST API zodat cookies goed gezet worden
    const host = req.headers.get('host')
    const baseUrl = host ? `http://${host}` : 'http://localhost:3000'
    const loginRes = await fetch(`${baseUrl}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
    if (loginRes.ok) {
      // Cookies worden automatisch door Next.js doorgegeven
      return Response.json({ success: true })
    } else {
      const data = await loginRes.json().catch(() => ({}))
      return Response.json({ error: data?.errors?.[0]?.message || 'Ongeldige inloggegevens.' }, { status: 401 })
    }
  } catch (e: any) {
    return Response.json({ error: e?.message || 'Ongeldige inloggegevens.' }, { status: 401 })
  }
}
