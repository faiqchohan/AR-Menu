import React from 'react'

/**
 * Fixed top header with circular logo and restaurant name.
 * Props:
 *  - name : string  — restaurant name from API
 *  - logo : string  — logo URL from API (empty string → emoji fallback)
 */
export default function Header({ name = '', logo = '' }) {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        zIndex: 50,
        backgroundColor: 'var(--theme-bg)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          padding: '16px 20px',
          position: 'relative',
        }}
      >
        {/* Circular logo — img from API or emoji fallback */}
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'var(--accent-color, #f59e0b)',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(var(--accent-color-rgb, 245,158,11),0.4), 0 0 30px rgba(var(--accent-color-rgb, 245,158,11),0.15)',
            overflow: 'hidden',
          }}
          aria-label={`${name} logo`}
        >
          {logo ? (
            <img
              src={logo}
              alt={`${name} logo`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            <span style={{ fontSize: '24px', lineHeight: 1 }}>🍔</span>
          )}
        </div>

        {/* Restaurant name + tagline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
          <h1
            style={{
              fontFamily: 'var(--theme-font)',
              fontSize: '22px',
              fontWeight: 800,
              color: 'var(--theme-text)',
              letterSpacing: '-0.5px',
              lineHeight: 1.1,
              position: 'relative',
            }}
          >
            {name}
          </h1>
          <p
            style={{
              fontFamily: 'var(--theme-font)',
              fontSize: '12px',
              fontWeight: 500,
              color: 'var(--accent-color, #f59e0b)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            AR Menu
          </p>
        </div>
      </div>
    </header>
  )
}
