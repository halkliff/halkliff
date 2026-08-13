import { describe, expect, it } from "vitest";
import {
  createMemoryModel,
  type MemoryElementType,
} from "@/app/(blog)/blog/(entries)/(01_memory-layout-for-react-devs)/memory-layout-for-react-devs/memory-model";

describe("memory visualizer model", () => {
  it.each([
    ["u8", 1],
    ["u16", 2],
    ["u32", 4],
  ] satisfies Array<[MemoryElementType, number]>) (
    "models %s arrays as contiguous bytes",
    (kind, elementBytes) => {
      const model = createMemoryModel(kind, 4);
      expect(model.elementBytes).toBe(elementBytes);
      expect(model.totalBytes).toBe(elementBytes * 4);
      expect(model.cells).toHaveLength(elementBytes * 4);
      expect(model.cells.map((cell) => cell.address)).toEqual(
        Array.from({ length: elementBytes * 4 }, (_, offset) => 0x1000 + offset),
      );
      expect(model.endAddress).toBe(0x1000 + elementBytes * 4 - 1);
      expect(model.cells.map((cell) => cell.group)).toEqual(
        Array.from({ length: elementBytes * 4 }, (_, offset) =>
          Math.floor(offset / elementBytes),
        ),
      );
    },
  );

  it("rejects invalid array lengths", () => {
    expect(() => createMemoryModel("u16", 0)).toThrow(RangeError);
    expect(() => createMemoryModel("u16", 2.5)).toThrow(RangeError);
  });
});
