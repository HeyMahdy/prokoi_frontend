/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline' *; object-src 'none';",
          },
        ],
      },
    ];
  },

  webpack: (config, { dev }) => {
    if (dev) {
      // Use eval-source-map to avoid CSP issues in dev mode
      config.devtool = 'eval-source-map';
    }
    return config;
  },
};

export default nextConfig;