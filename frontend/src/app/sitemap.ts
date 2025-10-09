import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.classconnect.cm';
  const logoUrl = `${baseUrl}/logo.png`;
  const languages = ['fr', 'en'];

  // Define routes with individual priorities and change frequencies
  const routes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: 'pricing', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: 'about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: 'contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: 'faq', priority: 0.7, changeFrequency: 'weekly' as const },
    { path: 'help', priority: 0.6, changeFrequency: 'weekly' as const },
    { path: 'privacy', priority: 0.5, changeFrequency: 'yearly' as const },
  ];

  // Auth routes with lower priority (not primary SEO targets)
  const authRoutes = [
    { path: 'auth/', priority: 0.5, changeFrequency: 'monthly' as const },
    { path: 'auth/login', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: 'auth/register', priority: 0.7, changeFrequency: 'monthly' as const },
  ];

  const sitemap: MetadataRoute.Sitemap = [];

  // Generate entries for all language versions of each route
  languages.forEach(lang => {
    routes.forEach(route => {
      // Create the language alternatives object
      const languageAlternates: Record<string, string> = {};
      languages.forEach(l => {
        languageAlternates[l] = `${baseUrl}/${l}${route.path ? `/${route.path}` : ''}`;
      });

      // Create the sitemap entry
      const entry: MetadataRoute.Sitemap[0] = {
        url: `${baseUrl}/${lang}${route.path ? `/${route.path}` : ''}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: languageAlternates
        }
      };

      // Add logo image to important pages only (homepage, pricing, about)
      if (route.priority >= 0.8) {
        entry.images = [logoUrl];
      }

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
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: languageAlternates
        }
      };

      sitemap.push(entry);
    });
  });

  return sitemap;
}