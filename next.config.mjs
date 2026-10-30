/** @type {import('next').NextConfig} */
const nextConfig = {
  // Le card arrivano fino a 4 MB (vedi lib/cardFile.ts) piu' l'overhead multipart; il default e' 1 MB.
  experimental: { serverActions: { bodySizeLimit: '6mb' } },
};

export default nextConfig;
