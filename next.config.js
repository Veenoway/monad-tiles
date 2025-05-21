/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://warpcast.com https://*.warpcast.com",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
