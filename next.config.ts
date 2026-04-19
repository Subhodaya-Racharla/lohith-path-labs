import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/",        destination: "/v2" },
        { source: "/tests",   destination: "/v2/tests" },
        { source: "/reports", destination: "/v2/reports" },
        { source: "/admin",   destination: "/v2/admin" },
      ],
    };
  },
};

export default nextConfig;
