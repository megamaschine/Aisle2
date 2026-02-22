import { useState } from 'react'

export default function ListSetup({ user, loading, onCreateList, onJoinList, onSignOut }) {
  const [mode, setMode] = useState(null) // null, 'create', 'join'
  const [shareCode, setShareCode] = useState('')
  const [createdCode, setCreatedCode] = useState(null)
  const [error, setError] = useState(null)
  const [working, setWorking] = useState(false)

  const handleCreate = async () => {
    setWorking(true)
    setError(null)
    try {
      const result = await onCreateList()
      setCreatedCode(result.shareCode)
    } catch (err) {
      console.error('Create list error:', err)
      setError(err.message || 'Failed to create list. Please try again.')
      setWorking(false)
    }
  }

  const handleJoin = async () => {
    if (shareCode.trim().length < 6) {
      setError('Please enter a 6-character share code')
      return
    }
    setWorking(true)
    setError(null)
    try {
      await onJoinList(shareCode.trim())
    } catch (err) {
      setError(err.message || 'Failed to join list')
      setWorking(false)
    }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />
        <div style={{ color: '#6366f1', fontSize: 18 }}>Loading...</div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      <div style={styles.card}>
        <img src="/icons/icon-192.png" alt="Aisle2" style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 12 }} />
        <h1 style={styles.title}>Welcome, {user.displayName?.split(' ')[0] || 'there'}!</h1>
        <p style={styles.subtitle}>
          Create a new grocery list or join an existing one with a share code.
        </p>

        {createdCode ? (
          <div style={styles.codeSection}>
            <p style={{ color: '#4ade80', fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              List created! Share this code:
            </p>
            <div style={styles.codeDisplay}>{createdCode}</div>
            <p style={{ color: '#64748b', fontSize: 12, marginTop: 8 }}>
              Give this code to anyone you want to share the list with.
            </p>
          </div>
        ) : !mode ? (
          <div style={styles.buttonGroup}>
            <button onClick={() => setMode('create')} style={styles.primaryBtn}>
              Create New List
            </button>
            <button onClick={() => setMode('join')} style={styles.secondaryBtn}>
              Join with Code
            </button>
          </div>
        ) : mode === 'create' ? (
          <div>
            <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 16 }}>
              Create a shared grocery list. You'll get a code to share with your household.
            </p>
            <button
              onClick={handleCreate}
              disabled={working}
              style={{ ...styles.primaryBtn, opacity: working ? 0.6 : 1 }}
            >
              {working ? 'Creating...' : 'Create List'}
            </button>
            <button onClick={() => { setMode(null); setError(null) }} style={styles.backBtn}>
              Back
            </button>
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={shareCode}
              onChange={(e) => setShareCode(e.target.value.toUpperCase().slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              placeholder="Enter 6-letter code"
              maxLength={6}
              style={styles.codeInput}
              autoFocus
            />
            <button
              onClick={handleJoin}
              disabled={working}
              style={{ ...styles.primaryBtn, opacity: working ? 0.6 : 1, marginTop: 12 }}
            >
              {working ? 'Joining...' : 'Join List'}
            </button>
            <button onClick={() => { setMode(null); setError(null); setShareCode('') }} style={styles.backBtn}>
              Back
            </button>
          </div>
        )}

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={onSignOut} style={styles.signOutBtn}>
          Sign out
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0f0f1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'DM Sans', sans-serif",
    padding: 20,
  },
  card: {
    background: '#1a1a2e',
    borderRadius: 24,
    padding: '40px 28px',
    maxWidth: 400,
    width: '100%',
    textAlign: 'center',
    border: '1px solid #2a2a40',
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 24,
    fontWeight: 700,
    color: '#e2e8f0',
    margin: '0 0 4px',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 1.5,
    margin: '8px 0 28px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  primaryBtn: {
    width: '100%',
    padding: '14px 20px',
    borderRadius: 14,
    border: 'none',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: '#fff',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'transform 0.15s',
  },
  secondaryBtn: {
    width: '100%',
    padding: '14px 20px',
    borderRadius: 14,
    border: '2px solid #2a2a40',
    background: 'transparent',
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  codeInput: {
    width: '100%',
    padding: '16px',
    borderRadius: 14,
    border: '2px solid #2a2a40',
    background: '#13131f',
    color: '#e2e8f0',
    fontSize: 24,
    fontWeight: 700,
    fontFamily: 'monospace',
    textAlign: 'center',
    letterSpacing: 8,
    outline: 'none',
    boxSizing: 'border-box',
  },
  codeSection: {
    padding: '20px 0',
  },
  codeDisplay: {
    fontSize: 36,
    fontWeight: 700,
    fontFamily: 'monospace',
    color: '#6366f1',
    letterSpacing: 8,
    padding: '16px',
    background: '#13131f',
    borderRadius: 14,
    border: '2px solid #6366f133',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: 13,
    cursor: 'pointer',
    marginTop: 12,
    fontFamily: 'inherit',
    padding: 8,
  },
  error: {
    color: '#f87171',
    fontSize: 13,
    marginTop: 12,
  },
  signOutBtn: {
    background: 'none',
    border: 'none',
    color: '#475569',
    fontSize: 12,
    cursor: 'pointer',
    marginTop: 24,
    fontFamily: 'inherit',
    padding: 8,
  },
}
