import { useRef, useState, useCallback } from 'react'
import { CATEGORIES } from '../constants'
import { useSwipe } from '../hooks/useSwipe'

export default function GroceryItem({ item, members, onToggle, onDelete, onEdit, isNew, isDeleting }) {
  const itemRef = useRef(null)
  const [showDelete, setShowDelete] = useState(false)
  const cat = CATEGORIES.find((c) => c.id === item.category) || CATEGORIES[9]
  const assignedMember = item.assignedTo && members.find((m) => m.id === item.assignedTo)

  const handleSwipeLeft = useCallback(() => {
    setShowDelete(true)
  }, [])

  const handleSwipeRight = useCallback(() => {
    onToggle()
  }, [onToggle])

  const handleTap = useCallback(() => {
    if (showDelete) {
      setShowDelete(false)
    } else {
      onEdit(item)
    }
  }, [showDelete, onEdit, item])

  useSwipe(itemRef, {
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    onTap: handleTap,
  })

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 14,
        overflow: 'hidden',
        animation: isNew
          ? 'slideInFromTop 0.35s cubic-bezier(0.4,0,0.2,1)'
          : isDeleting
          ? 'slideOutLeft 0.3s ease-in forwards'
          : 'none',
      }}
    >
      {/* Swipe backgrounds */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
      }}>
        <div style={{
          flex: 1,
          background: '#16a34a',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 20,
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          gap: 6,
        }}>
          ✓ {item.checked ? 'Uncheck' : 'Done'}
        </div>
        <div style={{
          flex: 1,
          background: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: 20,
          color: '#fff',
          fontWeight: 700,
          fontSize: 14,
          gap: 6,
        }}>
          Delete ✕
        </div>
      </div>

      {/* Main item content */}
      <div
        ref={itemRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          background: item.checked ? '#1a1a2a' : '#1e1e30',
          borderRadius: 14,
          borderLeft: `4px solid ${item.checked ? '#333' : cat.color}`,
          opacity: item.checked ? 0.55 : 1,
          transition: 'transform 0.25s cubic-bezier(0.4,0,0.2,1), opacity 0.3s',
          cursor: 'pointer',
          position: 'relative',
          zIndex: 1,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'pan-y',
        }}
      >
        {/* Item info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: item.checked ? '#555' : '#e2e8f0',
              textDecoration: item.checked ? 'line-through' : 'none',
              letterSpacing: 0.2,
            }}
          >
            {item.name}
            {item.quantity > 1 && (
              <span style={{ color: cat.color, fontWeight: 700, marginLeft: 6, fontSize: 13 }}>
                x{item.quantity}
              </span>
            )}
          </div>
          {item.note && (
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, fontStyle: 'italic' }}>
              {item.note}
            </div>
          )}
        </div>

        {/* Assigned user badge */}
        {assignedMember && <span style={{ fontSize: 16 }}>{assignedMember.emoji}</span>}

        {/* Category badge */}
        <span style={{ fontSize: 16 }}>{cat.icon}</span>
      </div>

      {/* Delete confirmation */}
      {showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 80,
            background: '#dc2626',
            border: 'none',
            color: '#fff',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            zIndex: 2,
            borderRadius: '0 14px 14px 0',
            fontFamily: 'inherit',
          }}
        >
          Delete
        </button>
      )}
    </div>
  )
}
