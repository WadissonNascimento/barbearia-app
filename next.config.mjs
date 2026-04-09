/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["*.trycloudflare.com"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
      allowedOrigins: ["*.trycloudflare.com"],
    },
  },
};

export default nextConfig;
