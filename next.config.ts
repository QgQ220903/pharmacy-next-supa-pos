import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Thêm phần này để sửa lỗi Server Action trên GitHub Codespaces
  experimental: {
    serverActions: {
      allowedOrigins: [
        "localhost:3000",
        "*.app.github.dev",
        "*.githubpreview.dev"
      ],
    },
  },
};

export default nextConfig;