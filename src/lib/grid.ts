import type { GridSize, MapNode, Position } from '../types'

export function buildOccupancy(
  nodes: MapNode[],
): Map<string, string> {
  const occ = new Map<string, string>()
  for (const n of nodes) {
    for (let dy = 0; dy < n.size.height; dy++) {
      for (let dx = 0; dx < n.size.width; dx++) {
        occ.set(`${n.position.x + dx},${n.position.y + dy}`, n.id)
      }
    }
  }
  return occ
}

export function fitsAt(
  nodeId: string | null,
  pos: Position,
  size: GridSize,
  gridSize: GridSize,
  others: MapNode[],
): boolean {
  if (pos.x < 0 || pos.y < 0) return false
  if (pos.x + size.width > gridSize.width) return false
  if (pos.y + size.height > gridSize.height) return false
  for (const n of others) {
    if (n.id === nodeId) continue
    if (
      pos.x < n.position.x + n.size.width &&
      pos.x + size.width > n.position.x &&
      pos.y < n.position.y + n.size.height &&
      pos.y + size.height > n.position.y
    ) {
      return false
    }
  }
  return true
}

export function maxSizeFrom(
  node: MapNode,
  desired: GridSize,
  gridSize: GridSize,
  others: MapNode[],
): GridSize {
  const maxW = Math.min(desired.width, gridSize.width - node.position.x)
  const maxH = Math.min(desired.height, gridSize.height - node.position.y)
  let validW = 1
  for (let w = 1; w <= maxW; w++) {
    if (
      fitsAt(
        node.id,
        node.position,
        { width: w, height: node.size.height },
        gridSize,
        others,
      )
    ) {
      validW = w
    } else {
      break
    }
  }
  let validH = 1
  for (let h = 1; h <= maxH; h++) {
    if (
      fitsAt(
        node.id,
        node.position,
        { width: validW, height: h },
        gridSize,
        others,
      )
    ) {
      validH = h
    } else {
      break
    }
  }
  return { width: validW, height: validH }
}

export function clampSize(
  node: MapNode,
  desired: GridSize,
  gridSize: GridSize,
  others: MapNode[],
): GridSize {
  return maxSizeFrom(node, desired, gridSize, others)
}

export function minRequiredGridSize(nodes: MapNode[]): GridSize {
  let w = 1
  let h = 1
  for (const n of nodes) {
    w = Math.max(w, n.position.x + n.size.width)
    h = Math.max(h, n.position.y + n.size.height)
  }
  return { width: w, height: h }
}
