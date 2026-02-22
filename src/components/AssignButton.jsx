export default function AssignButton({ user, assigned, onClick }) {
  const isAssigned = assigned === user.id
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      style={{
        width: 30,
        height: 30,
        borderRadius: '50%',
        border: isAssigned ? `2px solid ${user.color}` : '2px solid #333',
        background: isAssigned ? `${user.color}33` : 'transparent',
        fontSize: 14,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
        padding: 0,
      }}
      title={`Assign to ${user.name}`}
    >
      {user.emoji}
    </button>
  )
}
