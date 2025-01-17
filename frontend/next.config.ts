import withPWA from 'next-pwa';

const pwaConfig = withPWA({
  dest: 'public',
});

// eslint-disable-next-line import/no-anonymous-default-export
export default {
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
  images: {
    remotePatterns:[
      {
          protocol: 'https',
          hostname:"**",
      },
      {
          protocol: 'http',
          hostname:"**",
      },
  ]
  },
};

// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

