/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['lucide-react'],
};

const withMDX = require('@next/mdx')()
module.exports = withMDX(nextConfig)
