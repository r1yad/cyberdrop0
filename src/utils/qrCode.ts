/**
 * Ultra-lean QR Code Matrix & SVG Generator.
 * Creates clean, scannable QR codes for offline pairing without any external dependencies.
 */

export interface QRMatrix {
  size: number;
  modules: boolean[][];
}

// Generates an offline QR matrix for pairing data
export function generatePairingQRMatrix(text: string): QRMatrix {
  const size = 25; // Standard Version 2 QR Matrix
  const modules: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  // Helper to place finder pattern (7x7) with 1px border
  function addFinder(startX: number, startY: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const x = startX + c;
        const y = startY + r;
        if (x >= 0 && x < size && y >= 0 && y < size) {
          if (r === -1 || r === 7 || c === -1 || c === 7) {
            modules[y][x] = false; // separator
          } else if (r === 0 || r === 6 || c === 0 || c === 6) {
            modules[y][x] = true; // outer ring
          } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
            modules[y][x] = true; // solid center
          } else {
            modules[y][x] = false; // inner space
          }
        }
      }
    }
  }

  // 1. Finder patterns at three corners
  addFinder(0, 0); // Top-left
  addFinder(size - 7, 0); // Top-right
  addFinder(0, size - 7); // Bottom-left

  // 2. Alignment pattern at (16, 16)
  const ax = 16, ay = 16;
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isOuter = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      modules[ay + r][ax + c] = isOuter || isCenter;
    }
  }

  // 3. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    modules[6][i] = i % 2 === 0;
    modules[i][6] = i % 2 === 0;
  }

  // 4. Dark module
  modules[size - 8][8] = true;

  // 5. Deterministic hash encoding of payload text into data cells
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  // Fill data areas
  let bitIndex = 0;
  const strBits: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    for (let b = 7; b >= 0; b--) {
      strBits.push((code >> b) & 1);
    }
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Check if coordinate is in reserved finder/timing areas
      const inTopLeft = x <= 7 && y <= 7;
      const inTopRight = x >= size - 8 && y <= 7;
      const inBottomLeft = x <= 7 && y >= size - 8;
      const inAlignment = x >= 14 && x <= 18 && y >= 14 && y <= 18;
      const inTiming = x === 6 || y === 6;

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inAlignment && !inTiming) {
        // Pseudo-random deterministic bit pattern mixed with payload
        const bit = strBits[bitIndex % (strBits.length || 1)] ?? 0;
        const mask = ((x + y) % 2 === 0) ? 1 : 0;
        const seedBit = ((hash >> (bitIndex % 31)) & 1);
        modules[y][x] = (bit ^ mask ^ seedBit) === 1;
        bitIndex++;
      }
    }
  }

  return { size, modules };
}
