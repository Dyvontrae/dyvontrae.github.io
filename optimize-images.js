const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = 'images';
const outputDir = 'dist/img';

// Filter for supported image types
const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];

fs.readdirSync(inputDir)
  .filter(file => {
    const ext = path.extname(file).toLowerCase();
    return supportedFormats.includes(ext);
  })
  .forEach(file => {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);
    
    sharp(inputPath)
      .resize(1200, null, { withoutEnlargement: true })
      .toFormat('webp')
      .toFile(outputPath.replace(/\.[^.]+$/, '.webp'))
      .catch(err => console.error(`Error processing ${file}:`, err));
  });