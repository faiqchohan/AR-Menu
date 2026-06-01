import React, { useRef, useState } from 'react'
import useRipple from '../hooks/useRipple'

/**
 * Floating CTA button fixed to the bottom-center of the viewport.
 *
 * Props:
 *  - onPress      : () => void   — called on tap
 *  - hasSelection : boolean      — true when a dish is already selected
 */
export default function FloatingButton({ onPress, hasSelection }) {
  const createRipple = useRipple()
  const btnRef = useRef(null)
  const [flashing, setFlashing] = useState(false)

  const handleClick = (e) => {
    createRipple(e)
    onPress()
    // Hint flash only fires when no prior selection
    if (!hasSelection) {
      setFlashing(true)
      setTimeout(() => setFlashing(false), 700)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 60,
        width: '100%',
        maxWidth: '480px',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div className="floating-pulse" style={{ display: 'flex' }}>
        <button
          ref={btnRef}
        id="ar-view-button"
        className={`ripple-container${flashing ? ' hint-flash' : ''}`}
        aria-label={
          hasSelection
            ? 'Reopen AR viewer for selected dish'
            : 'View a dish in AR on your table'
        }
        onClick={handleClick}
        style={{
          pointerEvents: 'auto',
          padding: '15px 36px',
          borderRadius: '999px',
          border: 'none',
          background: 'var(--accent-color, #f59e0b)',
          color: 'var(--theme-bg)',
          fontFamily: 'var(--theme-font)',
          fontSize: '15px',
          fontWeight: 700,
          letterSpacing: '0.1px',
          cursor: 'pointer',
          outline: 'none',
          WebkitAppearance: 'none',
          transition: 'transform 0.15s ease, filter 0.15s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.03)'
          e.currentTarget.style.filter = 'brightness(1.08)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.filter = 'brightness(1)'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.96)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
        onTouchStart={(e) => {
          e.currentTarget.style.transform = 'scale(0.96)'
        }}
        onTouchEnd={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        {hasSelection ? '✦ View on Your Table' : '✦ View on Your Table'}
      </button>
      </div>
    </div>
  )
}
