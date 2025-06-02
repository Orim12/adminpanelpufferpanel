import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    // Email added by default
    {
      name: 'role',
      label: 'Rol',
      type: 'select',
      options: [
        { label: 'Gebruiker', value: 'user' },
        { label: 'Admin', value: 'admin' },
      ],
      defaultValue: 'user',
      required: true,
      // Alleen admins mogen admin-rol instellen
      access: {
        update: ({ req }) => req.user?.role === 'admin',
        create: ({ req }) => req.user?.role === 'admin',
      },
      admin: {
        condition: ({ user }) => user?.role === 'admin',
      },
    },
    // Add more fields as needed
  ],
}
