/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Required for Capacitor/Native builds
  images: {
    unoptimized: true, // Required because static export can't process images on the fly
  },
  // Note: redirects() are removed because they don't work with 'output: export'
};

export default nextConfig;