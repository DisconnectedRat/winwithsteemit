import { createRequire } from "module";
import webpack from "webpack";

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  webpack: (config, { isServer }) => {
    // ✅ Prevent bytebuffer-node.js from ever being used
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "bytebuffer": require.resolve("bytebuffer"), // use pure JS version
      "bytebuffer-node": false, // 🚫 disable completely
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        buffer: require.resolve("buffer/"),
        stream: false,
        fs: false,
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
