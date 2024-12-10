/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'via.placeholder.com',
          pathname: '/**',
        },
        {
          protocol: 'http',
          hostname: 'k.kakaocdn.net',
          pathname: '/**',
        }
        ,{
          protocol: 'https',
          hostname: 'img.danawa.com',
          pathname: '/**',
        }
      ],
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: true,
    },
    webpack: (config) => {
      config.externals.push({
        'utf-8-validate': 'commonjs utf-8-validate',
        'bufferutil': 'commonjs bufferutil',
      })
      return config
    },
    pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
    experimental: {
      
    },
  };
  
  export default nextConfig;