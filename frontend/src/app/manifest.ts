import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Next.js PWA',
    short_name: 'NextPWA',
    description: 'A Progressive Web App built with Next.js',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/logo_dark(192x192).jpg',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo_dark(512x512).jpg',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    screenshots: [
        {
          src: '/screenshot1.jpg',
          sizes: '640x480',
          type: 'image/jpg',
        },
        {
          src: '/screenshot2.jpg',
          sizes: '1280x720',
          type: 'image/jpg',
        },
      ],
  }
}