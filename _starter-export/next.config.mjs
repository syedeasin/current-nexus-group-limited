/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // Replace with your own Supabase project's storage hostname
        // (was the source project's specific project ref).
        hostname: 'YOUR-PROJECT-REF.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
