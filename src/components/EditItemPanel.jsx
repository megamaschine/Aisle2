import { useState, useEffect } from 'react'
import { CATEGORIES } from '../constants'
import CategoryPill from './CategoryPill'
import AssignButton from './AssignButton'

export default function EditItemPanel({ item, members, onSave, onDelete, onClose }) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [category, setCategory] = useState('other')
  const [assignedTo, setAssignedTo] = useState(null)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (item) {
      setName(item.name || '')
      setQuantity(item.quantity || 1)
      setCategory(item.category || 'other')
      setAssignedTo(item.assignedTo || null)
      setNote(item.note || '')
    }
  }, [item])

  if (!item) return null

  const handleSave = () => {
    onSave(item.id, { name: name.trim() || item.name, quantity, category, assignedTo, note })
    onClose()
  }

  const handleDelete = () => {
    onDelete(item.id)
    onClose()
  }

  const toggleAssign = (userId) => {
    setAssignedTo(assignedTo === userId ? null : userId)
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 100,
          animation: 'fadeIn 0.2s ease-out',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#1a1a2e',
          borderRadius: '20px 20px 0 0',
          zIndex: 101,
          padding: '20px 20px',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
          maxWidth: 480,
          margin: '0 auto',
          border: '1px solid #2a2a40',
          borderBottom: 'none',
          animation: 'slideUpPanel 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        <style>{`
          @keyframes slideUpPanel {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}</style>

        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#333' }} />
        </div>

        {/* Name input */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item name"
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 12,
            border: '2px solid #2a2a40',
            background: '#13131f',
            color: '#e2e8f0',
            fontSize: 16,
            fontWeight: 600,
            fontFamily: 'inherit',
            outline: 'none',
            boxSizing: 'border-box',
            marginBottom: 12,
          }}
        />

        {/* Quantity row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <span style={{ fontSize: 13, color: '#64748b' }}>Qty</span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: '#13131f',
            borderRadius: 10,
            border: '2px solid #2a2a40',
            padding: '4px 8px',
          }}>
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              style={{
                background: 'none', border: 'none', color: '#94a3b8',
                fontSize: 18, cursor: 'pointer', padding: '2px 6px', fontFamily: 'inherit',
              }}
            >−</button>
            <span style={{ color: '#e2e8f0', fontSize: 15, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              style={{
                background: 'none', border: 'none', color: '#94a3b8',
                fontSize: 18, cursor: 'pointer', padding: '2px 6px', fontFamily: 'inherit',
              }}
            >+</button>
          </div>
        </div>

        {/* Category pills */}
        <div style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 10,
          scrollbarWidth: 'none',
        }}>
          {CATEGORIES.map((cat) => (
            <CategoryPill
              key={cat.id}
              cat={cat}
              selected={category === cat.id}
              onClick={() => setCategory(cat.id)}
            />
          ))}
        </div>

        {/* Assign */}
        {members.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 13, color: '#64748b' }}>Assign</span>
            {members.map((u) => (
              <AssignButton
                key={u.id}
                user={u}
                assigned={assignedTo}
                onClick={() => toggleAssign(u.id)}
              />
            ))}
          </div>
        )}

        {/* Note input */}
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note..."
          style={{
            width: '100%',
            padding: '10px 16px',
            borderRadius: 12,
            border: '2px solid #2a2a40',
            background: '#13131f',
            color: '#e2e8f0',
            fontSize: 14,
            fontFamily: 'inherit',
            outline: 'none',
            boxSizing: 'border-box',
            marginBottom: 16,
          }}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: '14px',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Save
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: '14px 20px',
              borderRadius: 14,
              border: '2px solid #f8717144',
              background: 'transparent',
              color: '#f87171',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </>
  )
}
