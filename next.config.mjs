import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // hide the floating Next.js dev-tools indicator (the "N" bottom-left)
  devIndicators: false,
};

export default withMDX(config);
