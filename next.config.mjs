/** @type {import('next').NextConfig} */
const nextConfig = {
  // Le card arrivano fino a 5 MB (vedi lib/cardFile.ts); il default e' 1 MB.
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
};

export default nextConfig;
