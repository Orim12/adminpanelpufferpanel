// Voting page voor submissions
"use client"
import React, { useEffect, useState } from 'react'

interface Submission {
  id: string
  name: string
  link?: string
  file?: { url: string }
  status: string
  adminComment?: string
  votes?: { user: string }[]
  votesAgainst?: { user: string }[]
  votingDisabled?: boolean // frontend only
  votingClosed?: boolean // nieuw veld voor gesloten stemmen
}

interface User {
  id: string
  email: string
}

const VotePage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [voteMsg, setVoteMsg] = useState<string>('')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const userRes = await fetch('/api/me')
      const userData = await userRes.json()
      setUser(userData.user)
      const res = await fetch('/api/vote-list')
      const data = await res.json()
      setSubmissions(data.docs || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  async function handleVote(subId: string, type: 'voor' | 'tegen') {
    setVoteMsg('')
    // Disable knoppen direct na stemmen
    setSubmissions(submissions => submissions.map(s =>
      s.id === subId
        ? { ...s, votingDisabled: true }
        : s
    ))
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId: subId, type }),
    })
    const data = await res.json()
    if (res.ok) {
      setVoteMsg('Stem geregistreerd!')
      setSubmissions(submissions => submissions.map(s => {
        if (s.id !== subId) return s
        if (type === 'voor') {
          return {
            ...s,
            votes: [...(s.votes || []), { user: user!.id }],
            votesAgainst: s.votesAgainst || [],
            votingDisabled: true,
          }
        } else {
          return {
            ...s,
            votes: s.votes || [],
            votesAgainst: [...(s.votesAgainst || []), { user: user!.id }],
            votingDisabled: true,
          }
        }
      }))
    } else {
      setVoteMsg(data.error || 'Er ging iets mis met stemmen.')
      // Herstel knoppen als stemmen faalt
      setSubmissions(submissions => submissions.map(s =>
        s.id === subId
          ? { ...s, votingDisabled: false }
          : s
      ))
    }
  }

  if (loading) return <p>Inzendingen laden...</p>
  if (!user) return <p>Log in om te stemmen.</p>
  return (
    <div className="submission-list">
      <h2>Stem op een mod</h2>
      {voteMsg && <p>{voteMsg}</p>}
      <ul>
        {submissions.map(sub => {
          const getUserId = (u: unknown) => typeof u === 'string' ? u : (u && typeof u === 'object' && 'id' in u) ? (u as { id: string }).id : ''
          const hasVotedVoor = sub.votes?.some(v => getUserId(v.user) === user.id)
          const hasVotedTegen = sub.votesAgainst?.some?.(v => getUserId(v.user) === user.id)
          const votingDisabled = sub.votingDisabled || hasVotedVoor || hasVotedTegen || sub.votingClosed
          return (
            <li key={sub.id}>
              <b>{sub.name}</b> – {sub.votes?.length || 0} voor, {sub.votesAgainst?.length || 0} tegen
              {sub.votingClosed && (
                <span style={{ color: '#f39c12', marginLeft: 8 }}><b>Voting gesloten</b></span>
              )}
              {sub.link && (
                <>
                  {' '}| <a href={sub.link.startsWith('http') ? sub.link : `https://${sub.link}`} target="_blank" rel="noopener noreferrer">Link</a>
                </>
              )}
              {sub.file && (
                <>
                  {' '}| <a href={sub.file.url} target="_blank">.jar</a>
                </>
              )}
              <br />
              <button disabled={votingDisabled} onClick={() => handleVote(sub.id, 'voor')}>
                {hasVotedVoor ? 'Je stemde voor' : 'Stem voor'}
              </button>
              <button disabled={votingDisabled} onClick={() => handleVote(sub.id, 'tegen')} style={{marginLeft: 8}}>
                {hasVotedTegen ? 'Je stemde tegen' : 'Stem tegen'}
              </button>
              {sub.votingClosed && (
                <div style={{marginTop: 8, color: '#16a34a'}}>
                  <b>Resultaat:</b> {((sub.votes?.length || 0) > (sub.votesAgainst?.length || 0)) ? 'Meer voor' : ((sub.votes?.length || 0) < (sub.votesAgainst?.length || 0)) ? 'Meer tegen' : 'Gelijkspel'}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default VotePage
