export default function CategoryPill({ cat, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        borderRadius: 20,
        border: selected ? `2px solid ${cat.color}` : '2px solid transparent',
        background: selected ? `${cat.color}22` : '#1e1e2e',
        color: selected ? cat.color : '#94a3b8',
        fontSize: 13,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
        fontFamily: 'inherit',
      }}
    >
      <span>{cat.icon}</span>
      <span>{cat.label}</span>
    </button>
  )
}
