import type { CollectionConfig } from 'payload'

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
}
