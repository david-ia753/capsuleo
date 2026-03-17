/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix for 10MB limit in Middleware
  middlewareClientMaxBodySize: '50mb',
  
  serverActions: {
    bodySizeLimit: '50mb',
  },

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
