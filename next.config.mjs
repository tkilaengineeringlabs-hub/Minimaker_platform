import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 *
 * `next dev` and `next build` use different output folders so a production
 * build cannot delete the compiled dev pages while the local server is open.
 */
/**
 * @param {string} phase
 * @returns {Promise<import("next").NextConfig>}
 */
const createConfig = async (phase) => {
  await import("./src/env.mjs");

  /** @type {import("next").NextConfig} */
  const config = {
    reactStrictMode: true,
    distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next" : ".next-build",

    /**
     * If you have `experimental: { appDir: true }` set, then you must comment the below `i18n` config
     * out.
     *
     * @see https://github.com/vercel/next.js/issues/41980
     */
    i18n: {
      locales: ["en"],
      defaultLocale: "en",
    },
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "placekitten.com",
          port: "",
          pathname: "/100/100",
        },
      ],
    },
  };

  return config;
};

export default createConfig;
