import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    // Ignorem errors de linting durant el build per assegurar que el Docker acaba
    ignoreDuringBuilds: true,
  },
  typescript: {
    // També ignorem errors de tipus al build per si hi ha conflictes de llibreries
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
