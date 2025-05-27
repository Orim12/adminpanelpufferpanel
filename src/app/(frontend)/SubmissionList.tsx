"use client"
import React, { useEffect, useState } from 'react'

interface Submission {
  id: string
  name: string
  link?: string
  file?: { url: string }
  status: string
  adminComment?: string
}

interface Props {
  userId: string
}

const SubmissionList: React.FC<Props> = ({ userId }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSubmissions() {
      setLoading(true)
      const res = await fetch(`/api/submissions?user=${userId}`)
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data.docs || [])
      }
      setLoading(false)
    }
    fetchSubmissions()
  }, [userId])

  if (loading) return <p>Inzendingen laden...</p>
  if (!submissions.length) return <p>Je hebt nog geen inzendingen.</p>
  return (
    <div className="submission-list">
      <h2>Jouw inzendingen</h2>
      <ul>
        {submissions.map(sub => (
          <li key={sub.id}>
            <b>{sub.name}</b> – Status: {sub.status}
            {sub.link && (
              <>
                {' '}| <a href={sub.link} target="_blank">Link</a>
              </>
            )}
            {sub.file && (
              <>
                {' '}| <a href={sub.file.url} target="_blank">.jar</a>
              </>
            )}
            {sub.adminComment && (
              <>
                <br /><i>Admin: {sub.adminComment}</i>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default SubmissionList
