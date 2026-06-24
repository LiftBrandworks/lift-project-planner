import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-ancestors 'self' https://liftbrandworks.com https://www.liftbrandworks.com;"
          }
        ]
      }
    ];
  }
};

export default nextConfig;
