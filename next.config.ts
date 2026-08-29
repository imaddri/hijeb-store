import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,

  // ======================================================
  // ALLOWED DEV ORIGINS
  // يسمح للهاتف بالوصول إلى موارد Next.js أثناء التطوير
  // ======================================================

  allowedDevOrigins: [
    "192.168.1.70",
  ],

  // ======================================================
  // IMAGES
  // ======================================================

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },

  // ======================================================
  // EXPERIMENTAL
  // ======================================================

  experimental: {
    serverActions: {
      bodySizeLimit: "200mb",
    },
  },
};

export default nextConfig;