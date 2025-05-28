import type { CollectionConfig } from 'payload'
import fetch from 'node-fetch';
import path from 'path'
import fs from 'fs/promises'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function reloadserver(){
const url = 'https://panel.mirovaassen.nl/api/client/servers/3b761456/power';
const options = {
  method: 'POST',
  headers: {
    authorization: 'Bearer ' + process.env.PANEL_API_KEY,
    'content-type': 'application/json'
  },
  body: '{"signal":"restart"}'
};

try {
  const response = await fetch(url, options);
  const data = await response.json();
  console.log(data);
} catch (error) {
  console.error(error);
}
}

async function uploadFileToSftp({ doc, req }) {
  try {
    // Haal het media document op (file veld is een id of object)
    const fileId = doc.file && typeof doc.file === 'object' ? doc.file.id || doc.file._id : doc.file
    if (!fileId) return
    const mediaDoc = await req.payload.findByID({ collection: 'media', id: fileId })
    if (!mediaDoc?.filename) return
    const filePath = path.join(process.cwd(), 'media', mediaDoc.filename)
    const fileBuffer = await fs.readFile(filePath)
    // Gebruik __dirname zodat het pad altijd klopt, ook in Next.js/Payload
    const modPath = path.join(__dirname, '../../sftp/uploadMod.cjs')
    const uploadMod = await import(modPath)
    await uploadMod.uploadModViaSftp(fileBuffer, mediaDoc.filename)
  } catch (e) {
    console.error('SFTP upload error:', e)
  }
}

export const Submissions: CollectionConfig = {
  slug: 'submissions',
  admin: {
    useAsTitle: 'name',
  },
  hooks: {
    afterChange: [
      async (args) => {
        await uploadFileToSftp(args)
        await reloadserver()
      }
    ],
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
      label: 'Naam van mod',
      type: 'text',
      required: true,
      admin: {readOnly: true},
    },
    {
      name: 'file',
      label: '.jar of .zip bestand',
      type: 'upload',
      relationTo: 'media',
      required: true,
      // Uniekheid afdwingen op bestandsnaam
      hooks: {
        beforeChange: [async (args) => {
          const { value, req } = args;
          if (!value) return value;
          // Haal de bestandsnaam op uit media collectie
          const payload = req.payload;
          const mediaDoc = await payload.findByID({
            collection: 'media',
            id: value,
          });
          if (!mediaDoc?.filename) return value;
          // Zoek naar andere media met dezelfde bestandsnaam
          const existing = await payload.find({
            collection: 'media',
            where: { filename: { equals: mediaDoc.filename } },
            limit: 2,
          });
          // Als er meer dan 1 (dus een andere) is, blokkeer
          if (existing.docs.length > 1) {
            throw new Error('Er bestaat al een .jar bestand met deze naam. Kies een unieke bestandsnaam.');
          }
          return value;
        }],
      },
    },
    {
      name: 'link',
      label: 'GitHub/Modrinth/CurseForge link',
      type: 'text',
      required: true,
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
      admin: {
        position: 'sidebar',
      }
    },
    {
      name: 'adminComment',
      label: 'Opmerking van admin',
      type: 'textarea',
      required: false,
      admin: {
        position: 'sidebar',
      }
    },
  ],
}
