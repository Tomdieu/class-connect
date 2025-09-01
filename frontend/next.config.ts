import {withSentryConfig} from "@sentry/nextjs";
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

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: "trix-qx",

  project: "debug-classconnect-frontend",

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  automaticVercelMonitors: true,
});
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