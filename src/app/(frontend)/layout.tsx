import React from 'react'
import './styles.css'

export const metadata = {
  description: 'a website to submit fabric mods to a minecraft server.',
  title: 'submit form',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
}
