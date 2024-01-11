/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  async rewrites() {
    return [
      {
        source: '/api/:slug*/',
        destination: `${process.env.NEXT_PUBLIC_API_URL}:slug*/`, // Matched parameters can be used in the destination
      },
    ];
  },
};

module.exports = nextConfig;
