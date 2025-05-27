import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { headers as getHeaders } from 'next/headers'

export const GET = async () => {
  const headers = await getHeaders()
  const config = await configPromise
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })
  return Response.json({
    user: user ? { id: user.id, email: user.email } : null,
    adminUrl: config.routes?.admin || '/admin',
  })
}
