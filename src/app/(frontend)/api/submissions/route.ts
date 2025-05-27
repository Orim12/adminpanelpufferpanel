import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function GET(req: NextRequest) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const userId = req.nextUrl.searchParams.get('user')
  if (!userId) return Response.json({ docs: [] })
  const result = await payload.find({
    collection: 'submissions',
    where: { user: { equals: userId } },
    sort: '-createdAt',
  })
  return Response.json({ docs: result.docs })
}

export async function POST(req: NextRequest) {
  const config = await configPromise
  const payload = await getPayload({ config })
  const formData = await req.formData()
  const name = formData.get('name') as string
  const link = formData.get('link') as string | undefined
  const user = formData.get('user') as string
  let fileId: string | undefined = undefined
  const file = formData.get('file') as File | null

  if (file && file.size > 0) {
    // Upload bestand via Payload REST API endpoint
    const uploadForm = new FormData()
    let altValue = 'upload'
    if (typeof name === 'string' && name.trim().length > 0) {
      altValue = name.trim()
    }
    uploadForm.append('alt', altValue)
    uploadForm.append('file', file)
    // Auth cookie doorgeven
    const cookie = req.headers.get('cookie') || ''
    // Base URL bepalen uit headers
    let baseUrl = process.env.PAYLOAD_PUBLIC_URL || 'https://submit.mirovaassen.nl'
    if (!/^https?:\/\//i.test(baseUrl)) {
      baseUrl = 'https://' + baseUrl.replace(/^\/*/, '')
    }
    const uploadRes = await fetch(`${baseUrl}/api/media`, {
      method: 'POST',
      body: uploadForm,
      headers: { Cookie: cookie },
    })
    if (!uploadRes.ok) {
      const err = await uploadRes.text()
      return new Response('Uploaden van bestand mislukt: ' + err, { status: 400 })
    }
    const uploadData = await uploadRes.json()
    // Alleen een geldige 24-char hex string doorgeven
    if (uploadData?.id && typeof uploadData.id === 'string' && /^[a-fA-F0-9]{24}$/.test(uploadData.id)) {
      fileId = uploadData.id
    } else {
      fileId = undefined
    }
  }

  const submission = await payload.create({
    collection: 'submissions',
    data: {
      name,
      link,
      user,
      // fileId kan een string of een object zijn afhankelijk van uploadData
      file: fileId ? fileId : undefined,
      status: 'pending',
    },
  })
  return Response.json(submission)
}

export const config = {
  api: {
    bodyParser: false, // Nodig voor FormData/file uploads
    sizeLimit: '500mb',
  },
}
