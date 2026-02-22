import { useState } from 'react'

export default function LoginScreen({ onSignIn }) {
  const [signingIn, setSigningIn] = useState(false)
  const [error, setError] = useState(null)

  const handleSignIn = async () => {
    setSigningIn(true)
    setError(null)
    try {
      await onSignIn()
    } catch (err) {
      setError('Sign-in failed. Please try again.')
      setSigningIn(false)
    }
  }

  return (
    <div style={styles.container}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet" />

      <div style={styles.card}>
        <img src="/icons/icon-192.png" alt="Aisle2" style={styles.logo} />
        <h1 style={styles.title}>Aisle2</h1>
        <p style={styles.subtitle}>
          Share a grocery list with your household. Add items, assign them, and sync in real-time.
        </p>

        <button
          onClick={handleSignIn}
          disabled={signingIn}
          style={{
            ...styles.googleBtn,
            opacity: signingIn ? 0.6 : 1,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span>{signingIn ? 'Signing in...' : 'Sign in with Google'}</span>
        </button>

        {error && <p style={styles.error}>{error}</p>}
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
    padding: '48px 32px',
    maxWidth: 380,
    width: '100%',
    textAlign: 'center',
    border: '1px solid #2a2a40',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 16,
  },
  title: {
    fontFamily: "'Playfair Display', serif",
    fontSize: 32,
    fontWeight: 700,
    margin: 0,
    background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    lineHeight: 1.6,
    margin: '12px 0 32px',
  },
  googleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 28px',
    borderRadius: 14,
    border: '2px solid #2a2a40',
    background: '#13131f',
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
    width: '100%',
    justifyContent: 'center',
  },
  error: {
    color: '#f87171',
    fontSize: 13,
    marginTop: 16,
  },
}
