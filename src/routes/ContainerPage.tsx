import { useLiveQuery } from 'dexie-react-hooks'
import { Pencil } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import CellMenuSheet from '../components/CellMenuSheet'
import ConfirmDialog from '../components/ConfirmDialog'
import EmptyContainerHint from '../components/EmptyContainerHint'
import Grid from '../components/Grid'
import NodeSheet from '../components/NodeSheet'
import type { NodeSheetMode } from '../components/NodeSheet'
import { db } from '../db'
import { deleteNode, updateNode } from '../db/nodes'
import { DEFAULT_ROOT_GRID, updateRootGridSize } from '../db/spaces'
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

  const [editing, setEditing] = useState(false)
  const [armed, setArmed] = useState<ArmedCell | null>(null)
  const [sheetMode, setSheetMode] = useState<NodeSheetMode | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [menuNode, setMenuNode] = useState<MapNode | null>(null)
  const [deleteNodeTarget, setDeleteNodeTarget] = useState<MapNode | null>(null)
  const [previewSize, setPreviewSize] = useState<GridSize | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

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
  const effectiveSize = previewSize ?? persistedSize

  const children = allInSpace.filter((n) => n.parentId === parentId)

  const containerIds = new Set<string>()
  for (const n of allInSpace) {
    if (n.parentId !== null) containerIds.add(n.parentId)
  }

  const armedHere =
    armed && armed.parentId === parentId ? armed.pos : null

  // Min size = first integer that contains all current children
  const maxX = children.reduce((m, n) => Math.max(m, n.position.x), -1)
  const maxY = children.reduce((m, n) => Math.max(m, n.position.y), -1)
  const minSize: GridSize = {
    width: Math.max(1, maxX + 1),
    height: Math.max(1, maxY + 1),
  }

  const handleArm = (pos: Position) => setArmed({ parentId, pos })

  const handleCreate = (pos: Position) => {
    setArmed(null)
    setSheetMode({ kind: 'create', spaceId, parentId, position: pos })
    setSheetOpen(true)
  }

  const handleEditLeaf = (node: MapNode) => {
    setArmed(null)
    setSheetMode({ kind: 'edit', node })
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
    const sourceNode = children.find(
      (n) => n.position.x === sourcePos.x && n.position.y === sourcePos.y,
    )
    if (!sourceNode) return
    const targetNode = children.find(
      (n) => n.position.x === targetPos.x && n.position.y === targetPos.y,
    )
    await db.transaction('rw', db.nodes, async () => {
      const ts = Date.now()
      if (targetNode) {
        await db.nodes.update(sourceNode.id, {
          position: targetPos,
          updatedAt: ts,
        })
        await db.nodes.update(targetNode.id, {
          position: sourcePos,
          updatedAt: ts,
        })
      } else {
        await db.nodes.update(sourceNode.id, {
          position: targetPos,
          updatedAt: ts,
        })
      }
    })
  }

  const handleResizeCommit = async (next: GridSize) => {
    setPreviewSize(null)
    if (parentId === null) {
      await updateRootGridSize(spaceId, next)
    } else if (currentNode) {
      await updateNode(currentNode.id, { childGridSize: next })
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        <span className="text-xs text-neutral-400">
          {effectiveSize.width} × {effectiveSize.height}
        </span>
        <button
          type="button"
          onClick={() => {
            setEditing((prev) => !prev)
            setArmed(null)
          }}
          className={
            editing
              ? 'flex items-center gap-1 rounded-full bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white'
              : 'flex items-center gap-1 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-medium text-neutral-700 active:bg-neutral-200'
          }
        >
          <Pencil className="h-3.5 w-3.5" />
          {editing ? '완료' : '편집'}
        </button>
      </div>

      <Breadcrumb path={path} spaceId={spaceId} />

      {children.length === 0 && !editing ? (
        <EmptyContainerHint spaceId={spaceId} isRoot={parentId === null} />
      ) : (
        <Grid
          gridRef={gridRef}
          spaceId={spaceId}
          gridSize={effectiveSize}
          nodes={children}
          containerIds={containerIds}
          editing={editing}
          armedPosition={armedHere}
          onArm={handleArm}
          onCreate={handleCreate}
          onEdit={handleEditLeaf}
          onMenu={handleMenu}
          onDragSwap={handleDragSwap}
          onResizePreview={setPreviewSize}
          onResizeCommit={handleResizeCommit}
          minSize={minSize}
          maxSize={MAX_GRID}
        />
      )}

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
