import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.classconnect.cm';
  const languages = ['fr', 'en'];
  const routes = [
    '',
    'faq',
    'help',
    'privacy',
    'pricing',
    'contact',
  ];

  const sitemap: MetadataRoute.Sitemap = [];

  // Generate entries for all language versions of each route
  languages.forEach(lang => {
    routes.forEach(route => {
      sitemap.push({
        url: `${baseUrl}/${lang}${route ? `/${route}` : ''}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.8,
        alternateRefs: languages
          .filter(l => l !== lang)
          .map(l => ({
            href: `${baseUrl}/${l}${route ? `/${route}` : ''}`,
            hreflang: l
          }))
      });
    });
  });

  // Add manifest and other static assets
  sitemap.push({
    url: `${baseUrl}/manifest.webmanifest`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5
  });

  return sitemap;
}