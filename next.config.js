/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEST_API_TOKEN: process.env.NEST_API_TOKEN,
    BOT_TOKEN: process.env.BOT_TOKEN
  }
}

module.exports = nextConfig
