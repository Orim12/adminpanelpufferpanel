import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  // Only allow server-side execution
  if (typeof window !== 'undefined') {
    return new Response('Not allowed', { status: 403 })
  }

  try {
    const { arrayBuffer, fileName } = await req.json()
    if (!arrayBuffer || !fileName) {
      return new Response('Missing parameters', { status: 400 })
    }
    // Dynamically import SFTP logic
    const { uploadModViaSftp } = await import('../../../../sftp/uploadMod.cjs')
    await uploadModViaSftp(Buffer.from(arrayBuffer.data), fileName)
    return new Response('SFTP upload successful', { status: 200 })
  } catch (e: any) {
    return new Response(`SFTP upload failed: ${e.message || e}`, { status: 500 })
  }
}
