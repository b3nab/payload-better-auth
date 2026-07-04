import type { CollectionConfig } from 'payload'
import { admin } from '@/access/admin'

export const Magazines: CollectionConfig<'magazines'> = {
  slug: 'magazines',
  access: {
    create: admin,
    delete: admin,
    read: admin,
    update: admin,
  },
  admin: {
    defaultColumns: ['name', 'rootURL', 'updatedAt'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'rootURL',
      label: 'Root URL',
      type: 'text',
      required: true,
      admin: {
        description: 'The root URL of the magazine website',
      },
    },
    {
      name: 'isFirstCrawl',
      label: 'First Crawl Needed',
      type: 'checkbox',
      required: true,
      defaultValue: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    // {
    //   name: 'news',
    //   type: 'relationship',
    //   relationTo: 'news',
    //   hasMany: true,
    //   admin: {
    //     description: 'News articles from this magazine',
    //   },
    // },
  ],
  timestamps: true,
}
