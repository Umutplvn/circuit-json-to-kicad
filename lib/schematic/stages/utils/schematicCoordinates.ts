import type { Point } from "circuit-json"
import { applyToPoint, type Matrix } from "transformation-matrix"

export type SchematicConnectionGrid = {
  x: ReadonlyMap<number, number>
  y: ReadonlyMap<number, number>
}

// KiCad's SCH_IU_PER_MM is 1e4 (100 nm per schematic internal unit).
// https://docs.kicad.org/doxygen/base__units_8h.html
// Round halves away from zero, as its schematic parser does with KiROUND.
export function toSchematicInternalUnits(mm: number): number {
  return Math.sign(mm) * Math.round(Math.abs(mm) * 10_000)
}

export function roundSchematicCoordinate(mm: number): number {
  return toSchematicInternalUnits(mm) / 10_000
}

export function transformSchematicPoint(
  transform: Matrix,
  point: Point,
): Point {
  const { x, y } = applyToPoint(transform, point)
  return { x: roundSchematicCoordinate(x), y: roundSchematicCoordinate(y) }
}

export function transformSchematicConnectionPoint(
  transform: Matrix,
  point: Point,
  grid?: SchematicConnectionGrid,
): Point {
  const transformed = applyToPoint(transform, point)
  if (!grid) return transformed
  const x = grid.x.get(toSchematicInternalUnits(transformed.x))
  const y = grid.y.get(toSchematicInternalUnits(transformed.y))
  if (x === undefined || y === undefined) {
    throw new Error("Schematic connection was not included in grid placement")
  }
  return { x: x / 10_000, y: y / 10_000 }
}
