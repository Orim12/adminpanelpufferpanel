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
  const link = formData.get('link') as string | ""
  const user = formData.get('user') as string
  let fileId: string | undefined = undefined // eslint-disable-line prefer-const
  const file = formData.get('file') as File | null

  if (file && file.size > 0) {
    // Zet file om naar een geschikt object voor Payload (Node.js File API is niet gelijk aan Payload's verwachte file object)
    // Gebruik een Buffer en geef mimetype, name en size expliciet mee
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    // Payload verwacht: { data, mimetype, name, size }
    const mediaDoc = await payload.create({
      collection: 'media',
      data: {
        alt: name || 'upload',
      },
      file: {
        data: buffer,
        mimetype: file.type || 'application/java-archive',
        name: file.name,
        size: file.size,
      },
    })
    // Daarna submission aanmaken met media id
    const submission = await payload.create({
      collection: 'submissions',
      data: {
        name,
        link,
        user,
        file: mediaDoc.id,
        status: 'pending',
      },
    })
    return Response.json(submission)
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
