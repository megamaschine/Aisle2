import { useState, useEffect } from 'react'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#4ade80', '#22d3ee', '#f87171', '#fbbf24']
const PARTICLE_COUNT = 40

export default function Confetti({ trigger }) {
  const [particles, setParticles] = useState([])

  useEffect(() => {
    if (trigger === 0) return
    const newParticles = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: `${trigger}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 6 + Math.random() * 6,
      rotation: Math.random() * 360,
    }))
    setParticles(newParticles)
    const timer = setTimeout(() => setParticles([]), 3000)
    return () => clearTimeout(timer)
  }, [trigger])

  if (particles.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      zIndex: 9999,
      overflow: 'hidden',
    }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: -10,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confettiFall ${p.duration}s ease-in ${p.delay}s forwards`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  )
}
