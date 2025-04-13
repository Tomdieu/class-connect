import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.classconnect.cm';
  const logoUrl = `${baseUrl}/logo.png`;
  const languages = ['fr', 'en'];
  const routes = [
    '',
    'faq',
    'help',
    'privacy',
    'pricing',
    'contact',
    'about',
  ];
  
  // Auth routes
  const authRoutes = [
    { path: 'auth/', priority: 1 },
    { path: 'auth/login', priority: 0.89 },
    { path: 'auth/register', priority: 0.89 },
  ];

  const sitemap: MetadataRoute.Sitemap = [];

  // Generate entries for all language versions of each route
  languages.forEach(lang => {
    routes.forEach(route => {
      // Create the language alternatives object
      const languageAlternates: Record<string, string> = {};
      languages.forEach(l => {
        languageAlternates[l] = `${baseUrl}/${l}${route ? `/${route}` : ''}`;
      });

      // Create the sitemap entry
      const entry: MetadataRoute.Sitemap[0] = {
        url: `${baseUrl}/${lang}${route ? `/${route}` : ''}`,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'weekly',
        priority: route === '' ? 1.0 : 0.99,
        alternates: {
          languages: languageAlternates
        }
      };
      
      // Add logo image to all pages
      entry.images = [logoUrl];
      
      sitemap.push(entry);
    });
    
    // Add auth routes for each language
    authRoutes.forEach(route => {
      // Create the language alternatives object for auth routes
      const languageAlternates: Record<string, string> = {};
      languages.forEach(l => {
        languageAlternates[l] = `${baseUrl}/${l}/${route.path}`;
      });

      // Create the sitemap entry for auth routes
      const entry: MetadataRoute.Sitemap[0] = {
        url: `${baseUrl}/${lang}/${route.path}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: route.priority,
        alternates: {
          languages: languageAlternates
        }
      };
      
      // Add logo image to auth pages too
      entry.images = [logoUrl];
      
      sitemap.push(entry);
    });
  });

  // Add manifest and other static assets
  sitemap.push({
    url: `${baseUrl}/manifest.webmanifest`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.89,
  });

  return sitemap;
}