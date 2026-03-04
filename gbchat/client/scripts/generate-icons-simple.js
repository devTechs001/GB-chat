// Simple PWA Icons Generator (No dependencies)
// Creates placeholder icons using Canvas API via Node.js
// Run: node scripts/generate-icons-simple.js

import { mkdir, writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import zlib from 'zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const publicDir = join(rootDir, 'public', 'icons');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Simple colored square PNG (blue gradient placeholder)
async function createSimplePNG(size) {
  const width = size;
  const height = size;

  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);  // bit depth
  ihdrData.writeUInt8(2, 9);  // color type (RGB)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk (simple blue image data)
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte
    for (let x = 0; x < width; x++) {
      // Gradient blue color
      const gradient = (x + y) / (width + height);
      rawData.push(Math.floor(14 - gradient * 4));   // R (0ea5e9 -> 0284c7)
      rawData.push(Math.floor(165 - gradient * 125)); // G
      rawData.push(Math.floor(233 - gradient * 26));  // B
    }
  }

  const compressed = zlib.deflateSync(Buffer.from(rawData));
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  
  const typeBuffer = Buffer.from(type);
  const crcData = Buffer.concat([typeBuffer, data]);
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0);
  
  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 implementation
function crc32(data) {
  let crc = 0xffffffff;
  const table = makeCRCTable();
  
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]) & 0xff];
  }
  
  return (crc ^ 0xffffffff) >>> 0;
}

function makeCRCTable() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  return table;
}

async function main() {
  try {
    await mkdir(publicDir, { recursive: true });
    console.log('🎨 Generating simple PWA icons...\n');
    
    for (const size of sizes) {
      const png = await createSimplePNG(size);
      await writeFile(join(publicDir, `icon-${size}x${size}.png`), png);
      console.log(`✓ Generated icon-${size}x${size}.png`);
    }
    
    console.log('\n✅ All icons generated successfully!');
    console.log(`📁 Icons saved to: ${publicDir}`);
    console.log('\n📝 Note: These are placeholder icons.');
    console.log('   For production, replace with your actual app icons.');
    console.log('   Install sharp for better quality: npm install sharp');
    console.log('   Then run: node scripts/generate-icons.js');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
