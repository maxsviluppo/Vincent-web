import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Allow Next.js to transpile the original Vite source files and lucide-react
  transpilePackages: ["lucide-react"],

  // Image optimization: allow remote hosts
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },

  compress: true,

  experimental: {
    optimizePackageImports: ["lucide-react", "motion"],
  },
  turbopack: {
    resolveAlias: {
      "react-router-dom": "./src/lib/router-shim.tsx",
      "@vincent-src": "./src/original-src",
    },
  },

  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },

  // Expose GA ID and AI Key to the client bundle
  env: {
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID || "",
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  },

  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@vincent-src": path.resolve(__dirname, "./src/original-src"),
      "@bespoint-src": path.resolve(__dirname, "./src/original-src"),
      "react-router-dom": path.resolve(
        __dirname,
        "./src/lib/router-shim.tsx"
      ),
    };
    return config;
  },
};

export default nextConfig;
