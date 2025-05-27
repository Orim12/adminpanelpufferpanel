"use client"
import { useState } from 'react'
import '../styles.css'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })
    if (res.ok) {
      setMessage('Succesvol ingelogd!')
      setTimeout(() => router.push('/'), 1000)
    } else {
      const data = await res.json().catch(() => ({}))
      setMessage(data?.errors?.[0]?.message || 'Ongeldige inloggegevens.')
    }
    setLoading(false)
  }

  return (
    <div className="home enhanced-home">
      <div className="content enhanced-content">
        <h1 className="main-title">Inloggen</h1>
        <form className="submission-form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Wachtwoord"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>{loading ? 'Bezig...' : 'Inloggen'}</button>
          {message && <p>{message}</p>}
        </form>
        <p className="subtitle">Nog geen account? <a href="/signup">Maak er een aan</a></p>
      </div>
    </div>
  )
}
