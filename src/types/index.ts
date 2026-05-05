export type ID = string

export interface Space {
  id: ID
  name: string
  ownerId: string
  createdAt: number
  updatedAt: number
}

export interface Position {
  x: number
  y: number
}

export interface GridSize {
  width: number
  height: number
}

export interface MapNode {
  id: ID
  spaceId: ID
  parentId: ID | null
  ownerId: string
  name: string
  color: string | null
  category: ID | null
  memo: string | null
  position: Position
  childGridSize: GridSize
  createdAt: number
  updatedAt: number
}

export interface Category {
  id: ID
  name: string
  color: string | null
  isBuiltIn: boolean
  ownerId: string | null
  createdAt: number
}

export interface ExportPayload {
  version: number
  exportedAt: string
  spaces: Space[]
  nodes: MapNode[]
  categories: Category[]
}
