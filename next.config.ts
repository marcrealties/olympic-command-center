import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',      // Crucial for your iOS build
  images: {
    unoptimized: true,   // Prevents image errors in static builds
  },
  /* Note: We removed the 'redirects' block here because 
     static exports don't support it. We handle the 
     redirect in your app/page.tsx instead.
  */
};

export default nextConfig;