// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     async redirects() {
//       return [
//         {
//           source: '/',
//           destination: '/login', // Replace with the path of your desired starting page
//           permanent: true,
//         },
//       ];
//     },
//   };
  
//   export default nextConfig;
import dotenv from 'dotenv';
import path from 'path';

/** @type {import('next').NextConfig} */
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

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
  env: {
    API_KEY: process.env.tAPI_KEY, // Make your API_KEY available
  },
};

export default nextConfig;
