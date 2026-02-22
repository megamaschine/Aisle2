import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { CATEGORIES } from '../constants'
import GroceryItem from './GroceryItem'
import AddItemForm from './AddItemForm'
import EditItemPanel from './EditItemPanel'
import AnimationStyles from './AnimationStyles'
import Confetti from './Confetti'

const MEMBER_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444']

export default function GroceryApp({
  user,
  listData,
  items,
  favorites,
  onAddItem,
  onUpdateItem,
  onToggleItem,
  onAssignItem,
  onDeleteItem,
  onSetNote,
  onClearCompleted,
  onTrackFavorite,
  onLeaveList,
  onSignOut,
}) {
  const [filter, setFilter] = useState('all')
  const [view, setView] = useState('active')
  const [showSettings, setShowSettings] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [newItemIds, setNewItemIds] = useState(new Set())
  const [deletingId, setDeletingId] = useState(null)
  const [showConfetti, setShowConfetti] = useState(0)

  const prevItemIdsRef = useRef(new Set())
  const prevProgressRef = useRef(0)

  // Build members array from listData.memberProfiles
  const members = useMemo(() => {
    if (!listData?.memberProfiles) return []
    return Object.entries(listData.memberProfiles).map(([uid, profile], index) => ({
      id: uid,
      name: profile.name || 'User',
      emoji: profile.emoji || '🧑',
      color: MEMBER_COLORS[index % MEMBER_COLORS.length],
    }))
  }, [listData])

  const handleAdd = useCallback(
    async ({ name, category, quantity }) => {
      await onAddItem({ name, category, quantity })
      await onTrackFavorite(name, category)
    },
    [onAddItem, onTrackFavorite]
  )

  // Track new items for slide-in animation
  useEffect(() => {
    const currentIds = new Set(items.map((i) => i.id))
    const prevIds = prevItemIdsRef.current
    const added = new Set()
    currentIds.forEach((id) => {
      if (!prevIds.has(id)) added.add(id)
    })
    if (added.size > 0) {
      setNewItemIds(added)
      const timer = setTimeout(() => setNewItemIds(new Set()), 400)
      return () => clearTimeout(timer)
    }
    prevItemIdsRef.current = currentIds
  }, [items])

  // Track progress for confetti
  const totalItems = items.filter((i) => !i.checked).length
  const checkedItems = items.filter((i) => i.checked).length
  const progress = items.length > 0 ? (checkedItems / items.length) * 100 : 0

  useEffect(() => {
    if (progress === 100 && prevProgressRef.current < 100 && items.length > 0) {
      setShowConfetti((c) => c + 1)
    }
    prevProgressRef.current = progress
  }, [progress, items.length])

  // Animated delete
  const handleAnimatedDelete = useCallback((itemId) => {
    setDeletingId(itemId)
    setTimeout(() => {
      onDeleteItem(itemId)
      setDeletingId(null)
    }, 300)
  }, [onDeleteItem])

  // Handle save from edit panel
  const handleEditSave = useCallback((itemId, updates) => {
    onUpdateItem(itemId, updates)
  }, [onUpdateItem])

  // Filtered and grouped items
  const filteredItems = items.filter((item) => {
    if (filter !== 'all' && item.assignedTo !== filter) return false
    if (view === 'active' && item.checked) return false
    if (view === 'completed' && !item.checked) return false
    return true
  })

  const groupedItems = CATEGORIES.map((cat) => ({
    ...cat,
    items: filteredItems.filter((item) => item.category === cat.id),
  })).filter((g) => g.items.length > 0)

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0f0f1a',
        fontFamily: "'DM Sans', sans-serif",
        color: '#e2e8f0',
        maxWidth: 480,
        margin: '0 auto',
        position: 'relative',
        paddingBottom: 20,
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap"
        rel="stylesheet"
      />
      <AnimationStyles />
      <Confetti trigger={showConfetti} />

      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16162a 100%)',
          padding: '24px 20px 16px',
          borderBottom: '1px solid #1e1e30',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 26,
                fontWeight: 700,
                margin: 0,
                background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              <img src="/icons/icon-192.png" alt="" style={{ width: 28, height: 28, borderRadius: 6, verticalAlign: 'middle', marginRight: 6 }} />
              Aisle2
            </h1>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0' }}>
              {totalItems} items left · {checkedItems} done
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {checkedItems > 0 && (
              <button
                onClick={onClearCompleted}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid #333',
                  background: 'transparent',
                  color: '#94a3b8',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Clear done
              </button>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                border: '1px solid #333',
                background: 'transparent',
                color: '#94a3b8',
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              ⚙️
            </button>
          </div>
        </div>

        {/* Settings dropdown */}
        {showSettings && (
          <div
            style={{
              background: '#252540',
              borderRadius: 14,
              padding: 16,
              marginBottom: 12,
              border: '1px solid #333',
            }}
          >
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
              Share code: <strong style={{ color: '#6366f1', letterSpacing: 2, fontFamily: 'monospace' }}>{listData.shareCode}</strong>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
              Members: {members.map((m) => `${m.emoji} ${m.name}`).join(', ')}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => { onLeaveList(); setShowSettings(false) }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid #444',
                  background: 'transparent',
                  color: '#94a3b8',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Switch list
              </button>
              <button
                onClick={onSignOut}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid #f8717144',
                  background: 'transparent',
                  color: '#f87171',
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {items.length > 0 && (
          <div
            style={{
              height: 4,
              background: '#1e1e30',
              borderRadius: 4,
              overflow: 'hidden',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                background:
                  progress === 100
                    ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                    : 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                borderRadius: 4,
                transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
              }}
            />
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: 10,
              border: 'none',
              background: filter === 'all' ? '#6366f1' : '#1e1e30',
              color: filter === 'all' ? '#fff' : '#94a3b8',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
          >
            All
          </button>
          {members.map((m) => (
            <button
              key={m.id}
              onClick={() => setFilter(m.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 10,
                border: 'none',
                background: filter === m.id ? '#6366f1' : '#1e1e30',
                color: filter === m.id ? '#fff' : '#94a3b8',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              {m.emoji} {m.name.split(' ')[0]}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button
            onClick={() => setView(view === 'active' ? 'completed' : 'active')}
            style={{
              padding: '6px 14px',
              borderRadius: 10,
              border: '1px solid #2a2a40',
              background: 'transparent',
              color: '#94a3b8',
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {view === 'active' ? 'Show done' : 'Show active'}
          </button>
        </div>
      </div>

      {/* Add item form */}
      <AddItemForm onAdd={handleAdd} favorites={favorites} />

      {/* Items grouped by category */}
      <div style={{ padding: '0 16px' }}>
        {groupedItems.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#475569' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>
              {view === 'active' ? '🎉' : '📋'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {view === 'active'
                ? items.length === 0
                  ? 'Add your first item above!'
                  : 'All done! Great job!'
                : 'No completed items yet'}
            </div>
          </div>
        )}

        {groupedItems.map((group) => (
          <div key={group.id} style={{ marginBottom: 16 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 8,
                padding: '4px 0',
              }}
            >
              <span style={{ fontSize: 14 }}>{group.icon}</span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: group.color,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                }}
              >
                {group.label}
              </span>
              <span style={{ fontSize: 11, color: '#475569' }}>({group.items.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {group.items.map((item) => (
                <GroceryItem
                  key={item.id}
                  item={item}
                  members={members}
                  onToggle={() => onToggleItem(item.id, item.checked)}
                  onDelete={() => handleAnimatedDelete(item.id)}
                  onEdit={(item) => setEditingItem(item)}
                  isNew={newItemIds.has(item.id)}
                  isDeleting={deletingId === item.id}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Edit panel */}
      <EditItemPanel
        item={editingItem}
        members={members}
        onSave={handleEditSave}
        onDelete={(id) => { handleAnimatedDelete(id); setEditingItem(null) }}
        onClose={() => setEditingItem(null)}
      />

      {/* Sync indicator */}
      <div
        style={{
          position: 'fixed',
          bottom: 12,
          right: 12,
          fontSize: 10,
          color: '#334155',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
        Live sync
      </div>
    </div>
  )
}
