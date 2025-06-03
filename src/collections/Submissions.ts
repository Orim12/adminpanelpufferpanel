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
  const text = await response.text();
  let data;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }
    console.log(data);
  } else {
    console.log('Lege response van server-restart endpoint');
  }
} catch (error) {
  console.error(error);
}
}

type UploadFileToSftpArgs = {
  doc: Record<string, unknown>;
  previousDoc?: Record<string, unknown>;
  req: {
    payload?: any;
  };
};

async function uploadFileToSftp({ doc, previousDoc, req }: UploadFileToSftpArgs): Promise<void> {
  if ((doc as any).status === 'approved' && (previousDoc as any)?.status !== 'approved') {
    try {
      let fileUrl: string | null = null;
      let fileName = `${(doc as any).name || 'mod'}-${(doc as any).id}.jar`;
      if ((doc as any).file && typeof (doc as any).file === 'object' && (doc as any).file.url) {
        fileUrl = (doc as any).file.url;
        if ((doc as any).file.filename) fileName = (doc as any).file.filename;
      } else if ((doc as any).file && typeof (doc as any).file === 'string') {
        // Zorg dat de URL altijd met http(s):// begint
        let base = process.env.PAYLOAD_PUBLIC_URL || 'http://localhost:3000';
        if (!/^https?:\/\//i.test(base)) {
          base = 'https://' + base.replace(/^\/*/, '');
        }
        const mediaRes = await (globalThis.fetch || (await import('node-fetch')).default)(`${base.replace(/\/$/, '')}/api/media/${(doc as any).file}`);
        const media = await mediaRes.json();
        fileUrl = media.url;
        if (media.filename) fileName = media.filename;
      }
      if (!fileUrl) throw new Error('Geen geldig .jar bestand gevonden bij deze submission.');
      console.log('PufferPanel: Gebruik fileUrl:', fileUrl, 'fileName:', fileName);

      // Zorg dat fileUrl absoluut is
      if (fileUrl && fileUrl.startsWith('/')) {
        const base = process.env.PAYLOAD_PUBLIC_URL || 'http://localhost:3000';
        fileUrl = base.replace(/\/$/, '') + fileUrl;
      }
      // Download het bestand naar een tijdelijke locatie
      const fetchImpl = globalThis.fetch || (await import('node-fetch')).default;
      const fileRes = await fetchImpl(fileUrl);
      if (!fileRes.ok) throw new Error('Download van .jar bestand mislukt.');
      const arrayBuffer = await fileRes.arrayBuffer();
      const tempPath = path.join('/tmp', fileName);
      await fs.writeFile(tempPath, Buffer.from(arrayBuffer));

      // SFTP upload via external Node.js server
      if (typeof window === 'undefined') {
        const res = await fetch(`${process.env.SFTP_SERVER_URL || 'http://localhost:4001'}/sftp-upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ arrayBuffer: Buffer.from(arrayBuffer), fileName }),
        });
        if (!res.ok) throw new Error(await res.text());
      }
      await fs.unlink(tempPath);
    } catch (e: unknown) {
      console.error('PufferPanel mod deploy/restart failed:', e);
      // Probeer adminComment te updaten met foutmelding
      if (doc && req && req.payload) {
        try {
          const errorMessage = e instanceof Error ? e.message : String(e);
          await req.payload.update({
            collection: 'submissions',
            id: (doc as any).id,
            data: {
              adminComment: `PufferPanel fout: ${errorMessage}`,
              status: 'pending',
            },
          });
        } catch (updateErr) {
          console.error('Kon adminComment niet bijwerken:', updateErr);
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
  hooks: {
    afterChange: [
      async (args) => {
        await uploadFileToSftp(args)
        await reloadserver()
        // Voting gesloten & meer voor dan tegen => server herstarten
        const doc: Record<string, unknown> = args.doc
        const votes = Array.isArray(doc.votes) ? doc.votes : []
        const votesAgainst = Array.isArray(doc.votesAgainst) ? doc.votesAgainst : []
        if (doc.votingClosed && votes.length > votesAgainst.length) {
          await uploadFileToSftp(args)
          await reloadserver()
        }
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
    // Voting system: array van userId's die gestemd hebben
    {
      name: 'votes',
      label: 'Stemmen (voor)',
      type: 'array',
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
      ],
      required: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      access: {
        create: () => false,
        update: () => false,
      },
    },
    // Tegenstemmen
    {
      name: 'votesAgainst',
      label: 'Stemmen (tegen)',
      type: 'array',
      fields: [
        {
          name: 'user',
          type: 'relationship',
          relationTo: 'users',
          required: true,
        },
      ],
      required: false,
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
      access: {
        create: () => false,
        update: () => false,
      },
    },
    // Voting gesloten veld
    {
      name: 'votingClosed',
      label: 'Voting gesloten',
      type: 'checkbox',
      defaultValue: false,
      required: false,
      admin: {
        position: 'sidebar',
      },
      access: {
        create: () => false,
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
  ],
}
