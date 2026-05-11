import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import CellMenuSheet from '../components/CellMenuSheet'
import ConfirmDialog from '../components/ConfirmDialog'
import Grid from '../components/Grid'
import GridSizeStepper from '../components/GridSizeStepper'
import NodeSheet from '../components/NodeSheet'
import type { NodeSheetMode } from '../components/NodeSheet'
import { db } from '../db'
import { deleteNode, updateNode } from '../db/nodes'
import { DEFAULT_ROOT_GRID, updateRootGridSize } from '../db/spaces'
import { buildOccupancy, fitsAt, minRequiredGridSize } from '../lib/grid'
import { getPath } from '../lib/path'
import type { GridSize, MapNode, Position, Space } from '../types'

type ArmedCell = { parentId: string | null; pos: Position }

const MAX_GRID: GridSize = { width: 12, height: 12 }

export default function ContainerPage() {
  const { spaceId, nodeId } = useParams()
  const parentId = nodeId ?? null

  const path = useLiveQuery(
    async () => (spaceId ? getPath(spaceId, parentId) : []),
    [spaceId, parentId],
  )

  const allInSpace = useLiveQuery(
    async () =>
      spaceId
        ? db.nodes.where('spaceId').equals(spaceId).toArray()
        : ([] as MapNode[]),
    [spaceId],
  )

  const [armed, setArmed] = useState<ArmedCell | null>(null)
  const [sheetMode, setSheetMode] = useState<NodeSheetMode | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [menuNode, setMenuNode] = useState<MapNode | null>(null)
  const [deleteNodeTarget, setDeleteNodeTarget] = useState<MapNode | null>(null)

  if (!spaceId) {
    return <NotFoundMessage message="잘못된 주소입니다." />
  }

  if (path === undefined || allInSpace === undefined) {
    return <div className="p-4 text-sm text-neutral-400">불러오는 중…</div>
  }

  if (path.length === 0) {
    return <NotFoundMessage message="공간을 찾을 수 없습니다." />
  }

  const space: Space | null =
    path[0].kind === 'space' ? path[0].space : null
  const currentNode = parentId
    ? (allInSpace.find((n) => n.id === parentId) ?? null)
    : null

  if (parentId !== null && !currentNode) {
    return <NotFoundMessage message="이 위치를 찾을 수 없습니다." />
  }

  const persistedSize: GridSize =
    parentId === null
      ? (space?.rootGridSize ?? DEFAULT_ROOT_GRID)
      : (currentNode?.childGridSize ?? DEFAULT_ROOT_GRID)

  const children = allInSpace.filter((n) => n.parentId === parentId)

  const containerIds = new Set<string>()
  for (const n of allInSpace) {
    if (n.parentId !== null) containerIds.add(n.parentId)
  }

  const armedHere =
    armed && armed.parentId === parentId ? armed.pos : null

  const minSize: GridSize = minRequiredGridSize(children)

  const handleArm = (pos: Position) => setArmed({ parentId, pos })

  const handleCreate = (pos: Position) => {
    setArmed(null)
    setSheetMode({ kind: 'create', spaceId, parentId, position: pos })
    setSheetOpen(true)
  }

  const handleMenu = (node: MapNode) => setMenuNode(node)

  const handleMenuEdit = () => {
    if (!menuNode) return
    const target = menuNode
    setMenuNode(null)
    setSheetMode({ kind: 'edit', node: target })
    setSheetOpen(true)
  }

  const handleMenuDelete = () => {
    if (!menuNode) return
    setDeleteNodeTarget(menuNode)
    setMenuNode(null)
  }

  const confirmDelete = async () => {
    if (!deleteNodeTarget) return
    await deleteNode(deleteNodeTarget.id)
  }

  const handleDragSwap = async (sourcePos: Position, targetPos: Position) => {
    if (sourcePos.x === targetPos.x && sourcePos.y === targetPos.y) return
    const sourceNode = children.find(
      (n) => n.position.x === sourcePos.x && n.position.y === sourcePos.y,
    )
    if (!sourceNode) return
    const occ = buildOccupancy(children)
    const targetOwnerId = occ.get(`${targetPos.x},${targetPos.y}`)
    const targetNode =
      targetOwnerId && targetOwnerId !== sourceNode.id
        ? (children.find((n) => n.id === targetOwnerId) ?? null)
        : null
    if (targetNode && targetNode.id !== sourceNode.id) {
      const others = children.filter(
        (n) => n.id !== sourceNode.id && n.id !== targetNode.id,
      )
      if (
        !fitsAt(
          sourceNode.id,
          targetPos,
          sourceNode.size,
          persistedSize,
          others,
        )
      ) {
        return
      }
      if (
        !fitsAt(
          targetNode.id,
          sourcePos,
          targetNode.size,
          persistedSize,
          others,
        )
      ) {
        return
      }
      await db.transaction('rw', db.nodes, async () => {
        const ts = Date.now()
        await db.nodes.update(sourceNode.id, {
          position: targetPos,
          updatedAt: ts,
        })
        await db.nodes.update(targetNode.id, {
          position: sourcePos,
          updatedAt: ts,
        })
      })
    } else {
      const others = children.filter((n) => n.id !== sourceNode.id)
      if (
        !fitsAt(
          sourceNode.id,
          targetPos,
          sourceNode.size,
          persistedSize,
          others,
        )
      ) {
        return
      }
      await updateNode(sourceNode.id, { position: targetPos })
    }
  }

  const handleResize = async (nodeId: string, size: GridSize) => {
    await updateNode(nodeId, { size })
  }

  const commitSize = async (next: GridSize) => {
    if (parentId === null) {
      await updateRootGridSize(spaceId, next)
    } else if (currentNode) {
      await updateNode(currentNode.id, { childGridSize: next })
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 px-4 pt-2 pb-1">
        <GridSizeStepper
          label="열"
          value={persistedSize.width}
          min={minSize.width}
          max={MAX_GRID.width}
          onChange={(w) =>
            commitSize({ width: w, height: persistedSize.height })
          }
        />
        <GridSizeStepper
          label="행"
          value={persistedSize.height}
          min={minSize.height}
          max={MAX_GRID.height}
          onChange={(h) =>
            commitSize({ width: persistedSize.width, height: h })
          }
        />
      </div>

      <Breadcrumb path={path} spaceId={spaceId} />

      <Grid
        gridSize={persistedSize}
        nodes={children}
        containerIds={containerIds}
        armedPosition={armedHere}
        onArm={handleArm}
        onCreate={handleCreate}
        onMenu={handleMenu}
        onDragSwap={handleDragSwap}
        onResize={handleResize}
      />

      <NodeSheet
        open={sheetOpen}
        onOpenChange={(next) => {
          setSheetOpen(next)
          if (!next) setSheetMode(null)
        }}
        mode={sheetMode}
      />

      <CellMenuSheet
        open={menuNode !== null}
        onOpenChange={(next) => {
          if (!next) setMenuNode(null)
        }}
        nodeName={menuNode?.name ?? ''}
        onEdit={handleMenuEdit}
        onDelete={handleMenuDelete}
      />

      <ConfirmDialog
        open={deleteNodeTarget !== null}
        onOpenChange={(next) => {
          if (!next) setDeleteNodeTarget(null)
        }}
        title={`"${deleteNodeTarget?.name ?? ''}"을(를) 삭제할까요?`}
        description="안에 들어 있는 모든 항목이 함께 삭제됩니다. 되돌릴 수 없습니다."
        confirmLabel="삭제"
        onConfirm={confirmDelete}
      />
    </div>
  )
}

function NotFoundMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-start gap-2 p-4">
      <p className="text-sm text-neutral-500">{message}</p>
      <Link to="/" className="text-sm text-blue-600 hover:underline">
        ← 공간 목록으로
      </Link>
    </div>
  )
}
