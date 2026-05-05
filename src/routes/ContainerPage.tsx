import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Breadcrumb from '../components/Breadcrumb'
import EmptyContainerHint from '../components/EmptyContainerHint'
import Grid from '../components/Grid'
import NodeSheet from '../components/NodeSheet'
import type { NodeSheetMode } from '../components/NodeSheet'
import { db } from '../db'
import { getPath } from '../lib/path'
import type { MapNode, Position } from '../types'

type ArmedCell = { parentId: string | null; pos: Position }

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

  if (!spaceId) {
    return <NotFoundMessage message="잘못된 주소입니다." />
  }

  if (path === undefined || allInSpace === undefined) {
    return <div className="p-4 text-sm text-neutral-400">불러오는 중…</div>
  }

  if (path.length === 0) {
    return <NotFoundMessage message="공간을 찾을 수 없습니다." />
  }

  const currentNode = parentId
    ? (allInSpace.find((n) => n.id === parentId) ?? null)
    : null

  if (parentId !== null && !currentNode) {
    return <NotFoundMessage message="이 위치를 찾을 수 없습니다." />
  }

  const gridSize = currentNode?.childGridSize ?? { width: 4, height: 4 }
  const children = allInSpace.filter((n) => n.parentId === parentId)

  const containerIds = new Set<string>()
  for (const n of allInSpace) {
    if (n.parentId !== null) containerIds.add(n.parentId)
  }

  const armedHere =
    armed && armed.parentId === parentId ? armed.pos : null

  const handleArm = (pos: Position) => {
    setArmed({ parentId, pos })
  }

  const handleCreate = (pos: Position) => {
    setArmed(null)
    setSheetMode({ kind: 'create', spaceId, parentId, position: pos })
    setSheetOpen(true)
  }

  const handleEdit = (node: MapNode) => {
    setArmed(null)
    setSheetMode({ kind: 'edit', node })
    setSheetOpen(true)
  }

  return (
    <div className="flex flex-col">
      <Breadcrumb path={path} spaceId={spaceId} />
      {children.length === 0 ? (
        <EmptyContainerHint spaceId={spaceId} isRoot={parentId === null} />
      ) : (
        <Grid
          spaceId={spaceId}
          gridSize={gridSize}
          nodes={children}
          containerIds={containerIds}
          armedPosition={armedHere}
          onArm={handleArm}
          onCreate={handleCreate}
          onEdit={handleEdit}
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
