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
    let baseUrl = ''
    const host = req.headers.get('host')
    if (host) {
      baseUrl = `http://${host}`
    } else {
      baseUrl = 'http://localhost:3000'
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
    fileId = uploadData?.id
  }

  const submission = await payload.create({
    collection: 'submissions',
    data: {
      name,
      link,
      user,
      file: fileId,
      status: 'pending',
    },
  })
  return Response.json(submission)
}
