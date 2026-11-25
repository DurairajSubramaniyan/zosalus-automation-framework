const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const IMAGES_DIR = path.resolve(__dirname, '..', 'test-data', 'images');

/**
 * CRC32 lookup table for valid PNG chunk generation
 */
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

/**
 * Generates a valid 240x240 RGB PNG image tailored to the pet's species and name
 * (e.g. warm golden retriever portrait palette for Dog, soft silver-lilac for Cat)
 * so that HTML5 canvas cropping in the Zosalus Crop Modal succeeds cleanly.
 *
 * @param {string} petName
 * @param {string} species
 * @returns {string} Absolute path to the generated PNG image file
 */
function generatePetAvatarImage(petName = 'Bruno', species = 'Dog') {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const safeName = petName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeSpecies = species.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filePath = path.join(IMAGES_DIR, `${safeName}-${safeSpecies}.png`);

  const width = 240;
  const height = 240;

  const isDog = species.toLowerCase().includes('dog') || species.toLowerCase().includes('canine');
  // Warm golden palette for dogs (Bruno), cool slate/amber for cats/others
  const bg = isDog ? [245, 234, 218] : [230, 236, 245];
  const coat = isDog ? [212, 155, 75] : [140, 150, 168];
  const ear = isDog ? [168, 110, 42] : [105, 115, 135];
  const dark = [45, 35, 28];
  const nose = isDog ? [55, 38, 28] : [215, 130, 140];

  const rawData = Buffer.alloc(height * (1 + width * 3));

  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 3);
    rawData[rowStart] = 0; // No filter
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 3;
      let r = bg[0];
      let g = bg[1];
      let b = bg[2];

      const dx = x - 120;
      const dy = y - 125;
      const distHead = Math.sqrt(dx * dx + dy * dy);

      // Ears
      const leftEarDist = Math.sqrt((x - 68) ** 2 + ((y - 95) * 0.7) ** 2);
      const rightEarDist = Math.sqrt((x - 172) ** 2 + ((y - 95) * 0.7) ** 2);
      if (leftEarDist < 28 || rightEarDist < 28) {
        [r, g, b] = ear;
      }

      // Head circle
      if (distHead < 62) {
        [r, g, b] = coat;
      }

      // Snout highlight
      const snoutDist = Math.sqrt(dx * dx + (y - 142) ** 2);
      if (snoutDist < 26) {
        r = Math.min(255, coat[0] + 28);
        g = Math.min(255, coat[1] + 28);
        b = Math.min(255, coat[2] + 25);
      }

      // Eyes
      const leftEye = Math.sqrt((x - 96) ** 2 + (y - 112) ** 2);
      const rightEye = Math.sqrt((x - 144) ** 2 + (y - 112) ** 2);
      if (leftEye < 7 || rightEye < 7) {
        [r, g, b] = dark;
      }

      // Nose
      const noseDist = Math.sqrt(dx * dx + ((y - 135) * 1.2) ** 2);
      if (noseDist < 10) {
        [r, g, b] = nose;
      }

      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idatData = zlib.deflateSync(rawData);
  const pngBuffer = Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idatData),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);

  fs.writeFileSync(filePath, pngBuffer);
  return filePath;
}

module.exports = {
  generatePetAvatarImage,
};
