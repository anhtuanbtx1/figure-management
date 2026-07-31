const nextConfig = {
  reactStrictMode: false,
  experimental: {
    // Giới hạn luồng worker khi build để tránh quá tải RAM (OOM)
    workerThreads: false,
    cpus: 1
  }
};

export default nextConfig;
