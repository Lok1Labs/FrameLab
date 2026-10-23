/**
 * Cells needed to cover a region with square mosaic blocks. The grid starts at
 * the region's top-left corner, matching the editor preview, so the last
 * row and column may extend past the region and get clipped.
 */
export function getMosaicGrid(width: number, height: number, blockSize: number) {
  if (width <= 0 || height <= 0) return { columns: 0, rows: 0 };
  const block = Math.max(1, blockSize);
  return {
    columns: Math.ceil(width / block),
    rows: Math.ceil(height / block),
  };
}
