// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: 'http',
//         hostname: 'localhost',
//         port: '5000',
//         pathname: '/uploads/**',
//       },
//     ],
//     unoptimized: true, 
//   }
// };

// export default nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/uploads/:path*',
        destination: 'http://localhost:5000/uploads/:path*',
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/uploads/**',
      },
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig