/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Strict type and lint checking enabled for production builds
  
  // Enable standalone output for optimized Docker builds
  output: "standalone",
};

export default nextConfig;
