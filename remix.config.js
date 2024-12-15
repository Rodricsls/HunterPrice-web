/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
    serverBuildTarget: "node-cjs",
    server: "./server.js",
    ignoredRouteFiles: [".*"],
    publicPath: "/build/",
    future: {
      v2_meta: true,
      v2_headers: true,
      v2_errorBoundary: true,
      v2_normalizeFormMethod: true,
    },
    env: {
      PUBLIC_API_BASE_URL: process.env.PUBLIC_API_BASE_URL,
    },
  };
  