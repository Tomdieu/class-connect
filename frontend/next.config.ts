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
  experimental: {
    esmExternals: "loose", // required for the canvas to work
  },
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }]; // required for the canvas to work
    return config;
  },
  // output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "**",
      },
      {
        protocol: 'http',
        hostname: "**",
      },
    ]
  },
};