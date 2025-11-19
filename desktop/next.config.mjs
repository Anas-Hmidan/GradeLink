/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export for production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  distDir: 'out',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure assets work in Electron
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  trailingSlash: true,
}

export default nextConfig
