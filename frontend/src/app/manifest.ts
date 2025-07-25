import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ClassConnect',
    short_name: 'ClassConnect',
    description: 'Apprenez à votre rythme avec ClassConnect',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      {
        "src": "/web-app-manifest-192x192.png",
        "sizes": "192x192",
        "type": "image/png",
        "purpose": "any"
      },
      {
        "src": "/web-app-manifest-512x512.png",
        "sizes": "512x512",
        "type": "image/png",
        "purpose": "any"
      }
    ],
    screenshots: [
        {
          src: '/screenshot.png',
          sizes: '375x666',
          type: 'image/jpg',
        },
        {
          src: '/screenshot1.png',
          sizes: '375x666',
          type: 'image/jpg',
        },
      ],
  }
}