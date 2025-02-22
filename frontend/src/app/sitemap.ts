import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.classconnect.cm',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://www.classconnect.cm/faq',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://www.classconnect.cm/help',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://www.classconnect.cm/privacy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://www.classconnect.cm/pricing',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://www.classconnect.cm/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Language specific routes
    {
      url: 'https://www.classconnect.cm/fr',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://www.classconnect.cm/en',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
}