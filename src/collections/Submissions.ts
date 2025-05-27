import type { CollectionConfig } from 'payload'
import path from 'path'
import fs from 'fs/promises'

// @ts-ignore
const notifyPufferPanel = async ({ doc, previousDoc, req }: any) => {
  if (doc.status === 'approved' && previousDoc?.status !== 'approved') {
    try {
      let fileUrl = null
      let fileName = `${doc.name || 'mod'}-${doc.id}.jar`
      if (doc.file && typeof doc.file === 'object' && doc.file.url) {
        fileUrl = doc.file.url
        if (doc.file.filename) fileName = doc.file.filename
      } else if (doc.file && typeof doc.file === 'string') {
        const mediaRes = await (globalThis.fetch || (await import('node-fetch')).default)(`${process.env.PAYLOAD_PUBLIC_URL || 'http://localhost:3000'}/api/media/${doc.file}`)
        const media = await mediaRes.json()
        fileUrl = media.url
        if (media.filename) fileName = media.filename
      }
      if (!fileUrl) throw new Error('Geen geldig .jar bestand gevonden bij deze submission.')
      console.log('PufferPanel: Gebruik fileUrl:', fileUrl, 'fileName:', fileName)

      // Zorg dat fileUrl absoluut is
      if (fileUrl && fileUrl.startsWith('/')) {
        const base = process.env.PAYLOAD_PUBLIC_URL || 'http://localhost:3000'
        fileUrl = base.replace(/\/$/, '') + fileUrl
      }
      // Download het bestand naar een tijdelijke locatie
      const fetchImpl = globalThis.fetch || (await import('node-fetch')).default
      const fileRes = await fetchImpl(fileUrl)
      if (!fileRes.ok) throw new Error('Download van .jar bestand mislukt.')
      const arrayBuffer = await fileRes.arrayBuffer()
      const tempPath = path.join('/tmp', fileName)
      await fs.writeFile(tempPath, Buffer.from(arrayBuffer))

      // SFTP upload - backend only, apart gezet zodat het niet door Next.js/Webpack wordt gebundeld
      async function uploadModViaSftp(arrayBuffer: ArrayBuffer, fileName: string) {
        const SftpClient = (await import('ssh2-sftp-client')).default as typeof import('ssh2-sftp-client')
        const sftp = new SftpClient()
        try {
          await sftp.connect({
            host: 'panel.mirovaassen.nl',
            port: 5657,
            username: 'server@gmail.com|5e8c8989',
            password: 'Vissen2102',
          })
          await sftp.put(Buffer.from(arrayBuffer), `/mods/${fileName}`)
          console.log('SFTP upload succesvol:', `/mods/${fileName}`)
        } finally {
          await sftp.end()
        }
      }

      // SFTP upload alleen in backend context
      if (typeof window === 'undefined') {
        await uploadModViaSftp(arrayBuffer, fileName)
      }
      await fs.unlink(tempPath)
    } catch (e: any) {
      console.error('PufferPanel mod deploy/restart failed:', e)
      // Probeer adminComment te updaten met foutmelding
      if (doc && req && req.payload) {
        try {
          await req.payload.update({
            collection: 'submissions',
            id: doc.id,
            data: {
              adminComment: `PufferPanel fout: ${e.message || e}`,
              status: 'pending',
            },
          })
        } catch (updateErr) {
          console.error('Kon adminComment niet bijwerken:', updateErr)
        }
      }
    }
  }
}

export const Submissions: CollectionConfig = {
  slug: 'submissions',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: ({ req: { user } }) => {
      // Alleen admins zien alles, gebruikers alleen hun eigen inzendingen
      if (user?.role === 'admin') return true
      return {
        user: {
          equals: user?.id,
        },
      }
    },
    create: () => true,
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      label: 'Naam van mod/plugin',
      type: 'text',
      required: true,
    },
    {
      name: 'file',
      label: '.jar bestand',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'link',
      label: 'GitHub/Modrinth/CurseForge link',
      type: 'text',
      required: false,
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Ingediend', value: 'pending' },
        { label: 'Goedgekeurd', value: 'approved' },
        { label: 'Afgewezen', value: 'rejected' },
      ],
      defaultValue: 'pending',
      required: true,
    },
    {
      name: 'adminComment',
      label: 'Opmerking van admin',
      type: 'textarea',
      required: false,
      admin: { readOnly: true },
    },
  ],
  hooks: {
    afterChange: [notifyPufferPanel],
  },
}
