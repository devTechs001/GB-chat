// Generate PWA icons from SVG
// Run: node scripts/generate-icons.js

import sharp from 'sharp';
import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'client', 'public', 'icons');

const sizes = [
  72,   // Android LDPI
  96,   // Android MDPI
  128,  // Generic
  144,  // Android HDPI
  152,  // iPad
  192,  // Android XHDPI (maskable)
  384,  // Larger displays
  512,  // Android XXHDPI (maskable)
];

// Create a simple gradient icon programmatically
async function createIcon(size) {
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g${size}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0ea5e9"/>
          <stop offset="100%" stop-color="#0284c7"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="${size * 0.234}" fill="url(#g${size})"/>
      <path d="M256 120c-88.4 0-160 61.6-160 137.6 0 43.2 22.8 81.6 58.4 107.2-4.8 28.8-26.4 56.8-26.4 56.8s34.4-4.8 64.8-20.8c20 5.6 41.6 8.8 63.2 8.8 88.4 0 160-61.6 160-137.6S344.4 120 256 120z" fill="white"/>
      <rect x="160" y="200" width="192" height="24" rx="12" fill="#0ea5e9"/>
      <rect x="160" y="240" width="160" height="24" rx="12" fill="#0ea5e9" opacity="0.7"/>
      <rect x="160" y="280" width="128" height="24" rx="12" fill="#0ea5e9" opacity="0.5"/>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(join(publicDir, `icon-${size}x${size}.png`));
  
  console.log(`✓ Generated icon-${size}x${size}.png`);
}

async function main() {
  try {
    await mkdir(publicDir, { recursive: true });
    console.log('🎨 Generating PWA icons...\n');
    
    for (const size of sizes) {
      await createIcon(size);
    }
    
    console.log('\n✅ All icons generated successfully!');
    console.log(`📁 Icons saved to: ${publicDir}`);
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

main();
