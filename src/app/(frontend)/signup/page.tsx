"use client"
import { useState } from 'react'
import '../styles.css'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (res.ok) {
      // Direct inloggen na registratie
      const loginRes = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })
      if (loginRes.ok) {
        setMessage('Account aangemaakt en ingelogd! Je wordt doorgestuurd...')
        setTimeout(() => window.location.href = '/', 1000)
      } else {
        setMessage('Account aangemaakt, maar automatisch inloggen is mislukt. Log handmatig in.')
      }
      setEmail('')
      setPassword('')
    } else {
      const data = await res.json().catch(() => ({}))
      setMessage(data?.error || 'Er ging iets mis.')
    }
    setLoading(false)
  }

  return (
    <div className="home enhanced-home">
      <div className="content enhanced-content">
        <h1 className="main-title">Account aanmaken</h1>
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
          <button type="submit" disabled={loading}>{loading ? 'Bezig...' : 'Account aanmaken'}</button>
          {message && <p>{message}</p>}
        </form>
        <p className="subtitle">Heb je al een account? <a href="/login">Log in</a></p>
      </div>
    </div>
  )
}
