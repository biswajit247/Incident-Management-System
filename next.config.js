/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
}

module.exports = nextConfig
