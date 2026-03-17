/** @type {import('next').NextConfig} */
const nextConfig = {
  // @ts-ignore - Definitive fix for 10MB limit in Middleware
  middlewareClientMaxBodySize: '50mb',
  
  serverActions: {
    bodySizeLimit: '50mb',
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },

  // Domaines autorisés pour les images (Google avatars, etc.)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
};

export default nextConfig;
