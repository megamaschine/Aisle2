import { useState, useEffect, useRef } from 'react'
import { CATEGORIES } from '../constants'
import CategoryPill from './CategoryPill'

export default function AddItemForm({ onAdd, favorites }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('other')
  const [quantity, setQuantity] = useState(1)
  const [showFavorites, setShowFavorites] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const inputRef = useRef(null)

  useEffect(() => {
    if (name.length > 0 && favorites.length > 0) {
      const filtered = favorites
        .filter((f) => f.name.toLowerCase().includes(name.toLowerCase()))
        .slice(0, 5)
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }, [name, favorites])

  const handleSubmit = () => {
    if (!name.trim()) return
    onAdd({ name: name.trim(), category, quantity })
    setName('')
    setQuantity(1)
    setSuggestions([])
    inputRef.current?.focus()
  }

  return (
    <div style={{ padding: '16px 16px 8px' }}>
      {/* Input row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Add item..."
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 12,
              border: '2px solid #2a2a40',
              background: '#13131f',
              color: '#e2e8f0',
              fontSize: 15,
              fontFamily: 'inherit',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={() => name === '' && setShowFavorites(true)}
            onBlur={() =>
              setTimeout(() => {
                setShowFavorites(false)
                setSuggestions([])
              }, 200)
            }
          />
          {/* Autocomplete suggestions */}
          {suggestions.length > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#252540',
                borderRadius: '0 0 12px 12px',
                zIndex: 20,
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                overflow: 'hidden',
              }}
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onMouseDown={() => {
                    setName(s.name)
                    setCategory(s.category)
                    setSuggestions([])
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '10px 16px',
                    background: 'transparent',
                    border: 'none',
                    color: '#e2e8f0',
                    fontSize: 14,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  <span>{CATEGORIES.find((c) => c.id === s.category)?.icon}</span>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quantity */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: '#13131f',
            borderRadius: 12,
            border: '2px solid #2a2a40',
            padding: '0 8px',
          }}
        >
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: 18,
              cursor: 'pointer',
              padding: '4px',
              fontFamily: 'inherit',
            }}
          >
            −
          </button>
          <span
            style={{
              color: '#e2e8f0',
              fontSize: 15,
              fontWeight: 700,
              minWidth: 20,
              textAlign: 'center',
            }}
          >
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: 18,
              cursor: 'pointer',
              padding: '4px',
              fontFamily: 'inherit',
            }}
          >
            +
          </button>
        </div>

        {/* Add button */}
        <button
          onClick={handleSubmit}
          style={{
            padding: '0 20px',
            borderRadius: 12,
            border: 'none',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            fontSize: 20,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'transform 0.15s',
          }}
        >
          +
        </button>
      </div>

      {/* Category selector */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollbarWidth: 'none',
        }}
      >
        {CATEGORIES.map((cat) => (
          <CategoryPill
            key={cat.id}
            cat={cat}
            selected={category === cat.id}
            onClick={() => setCategory(cat.id)}
          />
        ))}
      </div>

      {/* Quick-add favorites */}
      {showFavorites && favorites.length > 0 && name === '' && (
        <div style={{ marginTop: 4, marginBottom: 4 }}>
          <div
            style={{
              fontSize: 11,
              color: '#64748b',
              marginBottom: 6,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Frequently added
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {favorites.slice(0, 8).map((f, i) => (
              <button
                key={i}
                onMouseDown={() => {
                  setName(f.name)
                  setCategory(f.category)
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 10,
                  border: '1px solid #2a2a40',
                  background: '#1a1a2e',
                  color: '#cbd5e1',
                  fontSize: 13,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {CATEGORIES.find((c) => c.id === f.category)?.icon} {f.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
