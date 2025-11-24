// esbuild.config.js
require('dotenv').config({ path: './.env.production' });
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const distDir = 'dist';

// Ensure the dist directory exists
if (!fs.existsSync(distDir)){
    fs.mkdirSync(distDir);
}

// Copy index.html and index.css to dist
fs.copyFileSync(path.join(__dirname, 'index.html'), path.join(distDir, 'index.html'));
fs.copyFileSync(path.join(__dirname, 'index.css'), path.join(distDir, 'index.css'));


esbuild.build({
  entryPoints: ['index.tsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  minify: true,
  sourcemap: true,
  target: ['es2020'],
  define: {
    'process.env.API_KEY': `"${process.env.API_KEY}"`,
    'process.env.GOOGLE_CLIENT_ID': `"${process.env.GOOGLE_CLIENT_ID}"`,
  },
  loader: {
      '.tsx': 'tsx'
  }
}).then(() => {
    console.log('Build finished successfully!');
}).catch(() => process.exit(1));