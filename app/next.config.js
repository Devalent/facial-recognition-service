// @ts-check

const withImageLoader = require('next-image-loader');

/**
 * @type {import('next').NextConfig}
 **/
module.exports = withImageLoader({
  reactStrictMode: true,
  assetPrefix: process.env.API_TOKEN_GITHUB ? './' : '',
  images: {
    loader: 'custom',
  },
  env: {
    STANDALONE: Boolean(process.env.STANDALONE), // WebRTC server is not available, run on fake data instead
  },
});
