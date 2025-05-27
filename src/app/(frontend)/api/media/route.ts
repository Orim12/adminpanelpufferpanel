import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  // Proxy file upload to Payload backend
  const formData = await req.formData()
  const cookie = req.headers.get('cookie') || ''
  let baseUrl = process.env.PAYLOAD_PUBLIC_URL || 'http://localhost:3000'
  if (!/^https?:\/\//i.test(baseUrl)) {
    baseUrl = 'http://' + baseUrl.replace(/^\/*/, '')
  }
  const uploadRes = await fetch(`${baseUrl}/api/media`, {
    method: 'POST',
    body: formData,
    headers: { Cookie: cookie },
  })
  const text = await uploadRes.text()
  if (!uploadRes.ok) {
    return new Response(text, { status: uploadRes.status })
  }
  return new Response(text, { status: 200, headers: { 'Content-Type': 'application/json' } })
}
