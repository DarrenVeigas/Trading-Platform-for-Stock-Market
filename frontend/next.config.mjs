/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
      return [
        {
          source: '/',
          destination: '/login', // Replace with the path of your desired starting page
          permanent: true,
        },
      ];
    },
  };
  
  export default nextConfig;
  