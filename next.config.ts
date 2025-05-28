/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    domains: (() => {
      const domains = [];
      
      // Extract domain from API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const apiUrlObj = new URL(apiUrl);
      domains.push(apiUrlObj.hostname);
      
      // Add production API domain if different
      const prodApiUrl = process.env.NEXT_PUBLIC_PRODUCTION_API_URL;
      if (prodApiUrl) {
        const prodUrlObj = new URL(prodApiUrl);
        if (!domains.includes(prodUrlObj.hostname)) {
          domains.push(prodUrlObj.hostname);
        }
      }
      
      // Add configured domain names
      if (process.env.DOMAIN_NAME) {
        domains.push(process.env.DOMAIN_NAME);
      }
      
      if (process.env.NGINX_SERVER_NAME && !domains.includes(process.env.NGINX_SERVER_NAME)) {
        domains.push(process.env.NGINX_SERVER_NAME);
      }
      
      if (process.env.PRODUCTION_NGINX_SERVER_NAME && !domains.includes(process.env.PRODUCTION_NGINX_SERVER_NAME)) {
        domains.push(process.env.PRODUCTION_NGINX_SERVER_NAME);
      }
      
      return domains;
    })(),
    remotePatterns: (() => {
      const patterns = [];
      
      // Add pattern for current API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const apiUrlObj = new URL(apiUrl);
      patterns.push({
        protocol: apiUrlObj.protocol.replace(':', '') as 'http' | 'https',
        hostname: apiUrlObj.hostname,
        port: apiUrlObj.port || (apiUrlObj.protocol === 'https:' ? '443' : '80'),
        pathname: '/media/**',
      });
      
      // Add pattern for production API if different
      const prodApiUrl = process.env.NEXT_PUBLIC_PRODUCTION_API_URL;
      if (prodApiUrl) {
        const prodUrlObj = new URL(prodApiUrl);
        const existingPattern = patterns.find(p => 
          p.hostname === prodUrlObj.hostname && 
          p.protocol === prodUrlObj.protocol.replace(':', '')
        );
        
        if (!existingPattern) {
          patterns.push({
            protocol: prodUrlObj.protocol.replace(':', '') as 'http' | 'https',
            hostname: prodUrlObj.hostname,
            port: prodUrlObj.port || (prodUrlObj.protocol === 'https:' ? '443' : '80'),
            pathname: '/media/**',
          });
        }
      }
      
      // Add AWS S3 pattern for production CDN
      patterns.push({
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      });
      
      // Add pattern for domain name if configured
      if (process.env.DOMAIN_NAME) {
        patterns.push({
          protocol: 'https',
          hostname: process.env.DOMAIN_NAME,
          pathname: '/media/**',
        });
      }
      
      return patterns;
    })(),
  },
};

export default nextConfig;
