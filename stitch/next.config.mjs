/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  poweredByHeader: false,
  // Isolate dev artifacts from production build artifacts to prevent
  // chunk/module mismatches when both workflows run on the same repo.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  experimental: {
    optimizePackageImports: ["react", "react-dom"],
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return {
      fallback: [
        {
          source: "/api/:path*",
          destination: (process.env.API_SERVER_ORIGIN || "http://localhost:8900") + "/api/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
