import { createRequire } from "module";
import webpack from "webpack";

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Helps with debugging React-related issues
  output: "standalone",  // Ensures correct behavior in deployments
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve("buffer/"),
      };

      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
        })
      );
    }
    return config;
  },
};

export default nextConfig;
