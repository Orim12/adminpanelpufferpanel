import { NextRequest } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@/payload.config'
import { headers as getHeaders } from 'next/headers'

export async function POST(req: NextRequest) {
  const { submissionId, type } = await req.json()
  if (!submissionId || !['voor', 'tegen'].includes(type)) return Response.json({ error: 'Ongeldige parameters' }, { status: 400 })
  const headers = await getHeaders()
  const config = await configPromise
  const payload = await getPayload({ config })
  // Haal user info op
  const { user } = await payload.auth({ headers })
  if (!user) return Response.json({ error: 'Niet ingelogd' }, { status: 401 })
  // Haal submission op
  const submission = await payload.findByID({ collection: 'submissions', id: submissionId })
  if (!submission) return Response.json({ error: 'Submission niet gevonden' }, { status: 404 })

  // Gebruik dynamische veldtoegang via indexering
  const votes = (submission as Record<string, any>)["votes"] || []
  const votesAgainst = (submission as Record<string, any>)["votesAgainst"] || []
  const alreadyVoor = Array.isArray(votes) && votes.some((v: { user: string }) => v.user === user.id)
  const alreadyTegen = Array.isArray(votesAgainst) && votesAgainst.some((v: { user: string }) => v.user === user.id)
  if (alreadyVoor || alreadyTegen) {
    return Response.json({ error: 'Je hebt al gestemd op deze inzending.' }, { status: 400 })
  }
  // Voeg stem toe
  const data: Record<string, unknown> = {}
  // Helper om altijd een string user-id te krijgen
  function toUserIdArray(arr: unknown[]): { user: string }[] {
    return (arr || []).map((v) => {
      if (typeof v === 'object' && v && 'user' in v) {
        const userVal = (v as { user: string | { id: string } }).user
        return { user: typeof userVal === 'string' ? userVal : userVal?.id }
      }
      return { user: '' }
    })
  }
  if (type === 'voor') {
    data.votes = [...toUserIdArray(votes), { user: user.id }]
    data.votesAgainst = toUserIdArray(votesAgainst)
  } else {
    data.votes = toUserIdArray(votes)
    data.votesAgainst = [...toUserIdArray(votesAgainst), { user: user.id }]
  }
  await payload.update({
    collection: 'submissions',
    id: submissionId,
    data,
  })
  // Return votes arrays als plain array
  return Response.json({ success: true, votes: data.votes, votesAgainst: data.votesAgainst })
}
