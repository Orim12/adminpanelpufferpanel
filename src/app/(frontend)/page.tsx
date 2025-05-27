"use client"
import { useEffect, useState } from 'react'
import Image from 'next/image'
import SubmissionForm from './SubmissionForm'
import SubmissionList from './SubmissionList'
import './styles.css'

export default function HomePage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [adminUrl, setAdminUrl] = useState<string>('')

  useEffect(() => {
    // Ophalen van user info via een API route (bijv. /api/me)
    async function fetchUser() {
      const res = await fetch('/api/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setAdminUrl(data.adminUrl)
      }
    }
    fetchUser()
  }, [])

  return (
    <div className="home enhanced-home">
      <div className="content enhanced-content">
        <picture>
          <source srcSet="https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg" />
          <Image
            alt="Payload Logo"
            height={90}
            src="https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg"
            width={90}
            className="logo"
          />
        </picture>
        {!user && <>
          <h1 className="main-title" style={{marginBottom: 0}}>Minecraft Mod Upload Portal</h1>
          <p className="subtitle" style={{marginTop: 8, marginBottom: 24}}>
            Upload eenvoudig je eigen mods voor review en installatie op de server.<br />
            Maak een account aan of log in om te beginnen.
          </p>
        </>}
        {user && <>
          <h1 className="main-title">Welkom terug, {user.email}</h1>
          <p className="subtitle">Stuur hieronder je mod of modpack in, of bekijk de status van je inzendingen.</p>
        </>}
        <div className="links enhanced-links" style={{marginBottom: user ? 32 : 40}}>
          <a
            className="admin"
            href={adminUrl || '/admin'}
            rel="noopener noreferrer"
            target="_blank"
          >
            Admin Panel
          </a>
          {!user && (
            <>
              <a className="docs" href="/login">Log in</a>
              <a className="docs" href="/signup">Account aanmaken</a>
            </>
          )}
        </div>
        {user && <div className="form-section"><SubmissionForm userId={user.id} /></div>}
        {user && <div className="list-section"><SubmissionList userId={user.id} /></div>}
      </div>
      <div className="footer enhanced-footer">
      </div>
    </div>
  )
}
