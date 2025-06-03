import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'

export async function GET() {
  const config = await configPromise
  const payload = await getPayload({ config })
  // Haal alle submissions op, inclusief votes en file info
  const result = await payload.find({
    collection: 'submissions',
    depth: 2,
    sort: '-createdAt',
  })
  return Response.json({ docs: result.docs })
}
