export const MEMORY_ELEMENT_TYPES = {
  u8: { bytes: 1, color: "mint" },
  u16: { bytes: 2, color: "violet" },
  u32: { bytes: 4, color: "orange" },
} as const;

export type MemoryElementType = keyof typeof MEMORY_ELEMENT_TYPES;

export interface MemoryCell {
  address: number;
  group: number;
  offset: number;
  value: string;
}

export interface MemoryModel {
  cells: MemoryCell[];
  elementBytes: number;
  endAddress: number;
  kind: MemoryElementType;
  length: number;
  startAddress: number;
  totalBytes: number;
}

export function createMemoryModel(
  kind: MemoryElementType,
  length: number,
  startAddress = 0x1000,
): MemoryModel {
  if (!Number.isInteger(length) || length < 1) {
    throw new RangeError("Memory array length must be a positive integer.");
  }

  const elementBytes = MEMORY_ELEMENT_TYPES[kind].bytes;
  const totalBytes = elementBytes * length;
  const cells = Array.from({ length: totalBytes }, (_, offset) => ({
    address: startAddress + offset,
    value: ((offset * 37 + length * 11) % 256)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase(),
    group: Math.floor(offset / elementBytes),
    offset,
  }));

  return {
    cells,
    elementBytes,
    endAddress: startAddress + totalBytes - 1,
    kind,
    length,
    startAddress,
    totalBytes,
  };
}
