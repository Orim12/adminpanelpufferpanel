"use client"
import React, { useState, useRef, FormEvent } from 'react'


const url = process.env.NEXT_PUBLIC_API_URL
interface Props {
  userId: string
}

const SubmissionForm: React.FC<Props> = ({ userId }) => {
  const [name, setName] = useState('')
  const [link, setLink] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const fileInput = useRef<HTMLInputElement | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    const formData = new FormData()
    formData.append('name', name)
    if (link) formData.append('link', link)
    if (file) formData.append('file', file)
    formData.append('user', userId)
    const res = await fetch(url+'api/submissions', {
      method: 'POST',
      body: formData,
    })
    if (res.ok) {
      setMessage('Inzending verstuurd!')
      setName('')
      setLink('')
      setFile(null)
      if (fileInput.current) fileInput.current.value = ''
    } else {
      setMessage('Er ging iets mis.')
    }
  }

  return (
    <form className="submission-form" onSubmit={handleSubmit}>
      <h2>Stuur een mod/plugin in</h2>
      <input
        type="text"
        placeholder="Naam van mod/plugin"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="GitHub/Modrinth/CurseForge link (optioneel)"
        value={link}
        onChange={e => setLink(e.target.value)}
      />
      <input
        type="file"
        accept=".jar"
        ref={fileInput}
        onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
      />
      <button type="submit">Versturen</button>
      {message && <p>{message}</p>}
    </form>
  )
}

export default SubmissionForm
