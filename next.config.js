/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export', // Enables static HTML export
    basePath: '/dyvontrae.github.io', // For GitHub Pages
    images: {
      unoptimized: true // Required for static export
    }
  }
  
  module.exports = nextConfig