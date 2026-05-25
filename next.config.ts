import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {},
  serverExternalPackages: ["@iqlabs-official/ethereum-sdk"],
}

export default nextConfig
