import type { CollectionConfig } from 'payload'

import { isOwner, ownerField, ownerOrSelf, ROLE_OPTIONS } from '../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'roles'],
    group: 'Admin',
  },
  auth: true,
  access: {
    // Every signed-in staff account may open /admin; what they can do there depends on their roles.
    admin: ({ req }) => Boolean(req.user),
    create: isOwner,
    read: ownerOrSelf,
    update: ownerOrSelf,
    delete: isOwner,
  },
  hooks: {
    beforeChange: [
      // The very first account (created on /admin) becomes the owner, so nobody is locked out.
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const { totalDocs } = await req.payload.count({ collection: 'users', req })
        if (totalDocs === 0) data.roles = ['owner']
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['editor'],
      saveToJWT: true,
      options: ROLE_OPTIONS,
      access: {
        create: ownerField,
        update: ownerField,
      },
      admin: {
        description: 'The first account is always made the owner. After that, only the owner can change roles.',
      },
    },
  ],
}
