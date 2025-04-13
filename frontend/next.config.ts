import withPWA from "next-pwa";
import type { NextConfig } from 'next';
// We need to use a dynamic import for webpack plugins to avoid require statements
import('webpack-bundle-analyzer');

// Create the PWA configuration
const pwaConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

// Define webpack config with proper types
const nextConfig: NextConfig = {
  ...pwaConfig,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  // pageExtensions: ['ts', 'tsx'],
  output: "standalone",
  
  // Enhanced image configuration
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60, // Cache optimized images for 60 seconds
  },
  
  sassOptions: {
    silenceDeprecations: ["legacy-js-api"],
  },
  
  // Enable gzip compression
  compress: true,

  // Configure headers for better caching
  // async headers() {
  //   return [
  //     {
  //       source: '/_next/static/(.*)',
  //       headers: [
  //         {
  //           key: 'Cache-Control',
  //           value: 'public, max-age=31536000, immutable',
  //         },
  //       ],
  //     },
  //     {
  //       source: '/images/(.*)',
  //       headers: [
  //         {
  //           key: 'Cache-Control',
  //           value: 'public, max-age=86400, stale-while-revalidate=604800',
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default nextConfig;
// import withPWA from "next-pwa";

// const pwaConfig = withPWA({
//   dest: "public",
// });

// // eslint-disable-next-line import/no-anonymous-default-export
// export default {
//   ...pwaConfig,
//   eslint: {
//     // Warning: This allows production builds to successfully complete even if
//     // your project has ESLint errors.
//     ignoreDuringBuilds: true,
//   },
//   typescript: {
//     // !! WARN !!
//     // Dangerously allow production builds to successfully complete even if
//     // your project has type errors.
//     ignoreBuildErrors: true,
//   },
//   // pageExtensions: ['ts', 'tsx'],
//   output: "standalone",
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "**",
//       },
//       {
//         protocol: "http",
//         hostname: "**",
//       },
//     ],
//   },
//   sassOptions: {
//     silenceDeprecations: ["legacy-js-api"],
//   },
// };
