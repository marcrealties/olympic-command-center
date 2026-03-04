import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',      // This tells Vercel/Capacitor to make a static site
  images: {
    unoptimized: true,   // This is required for static exports
  },
};

export default nextConfig;