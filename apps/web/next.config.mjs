/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["geist"],
  images: {
    domains: ['abvikodzzsvmdljgcdhq.supabase.co', 'jbqushznasoaufpwsjfx.supabase.co', 'bjymhfrftpseknpnlbse.supabase.co'],
  },
};

export default nextConfig;