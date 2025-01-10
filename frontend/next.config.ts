import withPWA from 'next-pwa';

const pwaConfig = withPWA({
  dest: 'public'
});

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  ...pwaConfig,
  // next.js config
};

// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
// };

// export default nextConfig;

