/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Docker (only in production)
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,

  // Enable hot reloading in development
  reactStrictMode: true,

  // Webpack config for better hot reloading
  webpack: (config, { dev, isServer }) => {
    // Enable polling for file watching in Docker (development only)
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding
        ignored: /node_modules/,
      };
    }

    // Keep existing webpack optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: "deterministic",
        runtimeChunk: "single",
        usedExports: true,
        minimize: true,
        splitChunks: {
          chunks: "all",
          minSize: 20000,
          maxSize: 244000,
          maxAsyncRequests: 30,
          maxInitialRequests: 25,
          cacheGroups: {
            default: false,
            vendors: false,
            framework: {
              name: "framework",
              chunks: "all",
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            lib: {
              name: "lib",
              test: /[\\/]node_modules[\\/]/,
              priority: 30,
              minChunks: 1,
              reuseExistingChunk: true,
            },
            commons: {
              name: "commons",
              minChunks: 2,
              priority: 20,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

    // Better performance hints
    config.performance = {
      hints: dev ? false : "warning",
      maxAssetSize: 800000,
      maxEntrypointSize: 800000,
    };

    return config;
  },

  // Security Headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://www.google.com/recaptcha/api.js https://www.gstatic.com/recaptcha/api2/",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://www.gstatic.com/recaptcha/",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https: http: wss: ws: https://www.google.com https://www.google-analytics.com https://www.googletagmanager.com https://www.google.com/recaptcha/",
              "frame-src 'self' https://www.google.com https://www.google.com/recaptcha/ https://www.google.com/recaptcha/api2/",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(woff|woff2|ttf|otf)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // Prevent aggressive caching of HTML pages to avoid language cache issues
        // This only applies to non-static assets (HTML pages)
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=0, must-revalidate, stale-while-revalidate=0",
          },
        ],
        has: [
          {
            type: "header",
            key: "accept",
            value: "text/html",
          },
        ],
      },
    ];
  },

  // Redirect HTTP to HTTPS in production only
  async redirects() {
    // Only redirect in production
    if (process.env.NODE_ENV === "production") {
      return [
        {
          source: "/:path*",
          has: [
            {
              type: "header",
              key: "x-forwarded-proto",
              value: "http",
            },
          ],
          destination: "https://medo-freight.eu/:path*",
          permanent: true,
        },
      ];
    }
    // No redirects in development
    return [];
  },

  // Image Optimization - Optimized for LCP
  images: {
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: false,
    unoptimized: false,
    // Optimize for LCP
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // Performance Optimizations
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // Remove console in production (but keep errors for debugging)
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Optimize production builds
  swcMinify: true,

  // Latest performance features
  experimental: {
    optimizePackageImports: ["react-google-recaptcha-v3", "react", "react-dom"],
    serverMinification: true,
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // Optimize CSS loading
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },

  // Reduce initial bundle size - tree shaking
  modularizeImports: {
    react: {
      transform: "react/{{member}}",
    },
    "react-dom": {
      transform: "react-dom/{{member}}",
    },
  },

  // Disable source maps in production for better performance
  productionBrowserSourceMaps: false,

  // Optimize fonts
  optimizeFonts: true,
};

module.exports = nextConfig;
