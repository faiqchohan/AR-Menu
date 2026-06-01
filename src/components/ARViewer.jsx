import React, { useEffect, useRef, useState, useCallback } from 'react'

/**
 * Ring data for the surface-scanner animation.
 * Each ring pulses with a staggered delay so they breathe sequentially.
 */
const RINGS = [
  { diameter: 220, borderOpacity: 0.08, bgOpacity: 0.03, delay: '0s',    dur: '2.8s' },
  { diameter: 162, borderOpacity: 0.14, bgOpacity: 0.05, delay: '0.45s', dur: '2.8s' },
  { diameter: 110, borderOpacity: 0.22, bgOpacity: 0.08, delay: '0.9s',  dur: '2.8s' },
  { diameter: 66,  borderOpacity: 0.35, bgOpacity: 0.15, delay: '1.35s', dur: '2.8s' },
]

/**
 * The animated surface-scanner circle shown while waiting for AR to launch.
 * loading  → rings are dim, center blinks
 * ready    → rings pulse fully, center shows camera icon
 * launched → rings freeze, center shows checkmark
 */
function SurfaceScanner({ state }) {
  const loading  = state === 'loading'
  const launched = state === 'launched'

  return (
    <div
      style={{
        position: 'relative',
        width: '220px',
        height: '220px',
        flexShrink: 0,
      }}
    >
      {/* Concentric pulsing rings */}
      {RINGS.map(({ diameter, borderOpacity, bgOpacity, delay, dur }, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              display: 'block',
              width: diameter,
              height: diameter,
              borderRadius: '50%',
              border: `1.5px solid rgba(var(--accent-color-rgb, 245,158,11),${borderOpacity})`,
              background: `radial-gradient(circle, rgba(var(--accent-color-rgb, 245,158,11),${bgOpacity}) 0%, transparent 70%)`,
              animation: !launched
                ? `surfacePulse ${dur} ${delay} ease-in-out infinite`
                : 'none',
              opacity: launched ? 0.2 : undefined,
              transition: 'opacity 0.4s',
            }}
          />
        </span>
      ))}

      {/* Rotating scan line (only when ready/loading) */}
      {!launched && (
        <span
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            animation: 'scanRotate 4s linear infinite',
          }}
        >
          <span
            style={{
              display: 'block',
              width: '110px',
              height: '1px',
              background:
                'linear-gradient(90deg, transparent 0%, rgba(var(--accent-color-rgb, 245,158,11),0.5) 100%)',
              transformOrigin: 'left center',
            }}
          />
        </span>
      )}

      {/* Center circle */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: launched
              ? 'linear-gradient(135deg, #22c55e, #16a34a)'
              : loading
              ? 'rgba(var(--accent-color-rgb, 245,158,11),0.12)'
              : 'var(--accent-color, #f59e0b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: launched
              ? '0 0 24px rgba(34,197,94,0.4)'
              : '0 0 24px rgba(var(--accent-color-rgb, 245,158,11),0.35)',
            transition: 'background 0.4s, box-shadow 0.4s',
            animation: loading ? 'centerBlink 1.2s ease-in-out infinite' : 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--theme-text)' }}>
            {launched ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main ARViewer ────────────────────────────────────────────────────────────

/**
 * Full-screen AR launcher overlay.
 *
 * UX flow:
 *  Tap item → overlay slides up → user sees "AR launch pad"
 *  Tap "Place on Your Table" → model-viewer.activateAR() fires
 *  → phone camera opens with the dish placed on real surface
 *  → user exits AR → back to this overlay → tap ✕ to close
 *
 * The model-viewer is kept off-screen (1px, hidden) while the scanner UI
 * is visible, so it loads in the background without blocking the animation.
 * Tapping "Preview 3D" reveals the actual model-viewer viewport.
 */
export default function ARViewer({ dish, isOpen, onClose }) {
  const modelRef   = useRef(null)

  // Keep last dish so slide-down animation shows correct content
  const lastDishRef = useRef(dish)
  if (dish) lastDishRef.current = dish
  const displayDish = dish ?? lastDishRef.current

  // 'loading' | 'ready' | 'unsupported' | 'launched'
  const [scanState,   setScanState]   = useState('loading')
  const [arLaunching, setArLaunching] = useState(false)
  const [modelError,  setModelError]  = useState(null)

  // Reset when a new dish is selected
  useEffect(() => {
    setScanState('loading')
    setArLaunching(false)
    setModelError(null)
  }, [displayDish?.id])

  // Body-scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Wire up model-viewer events
  useEffect(() => {
    const mv = modelRef.current
    if (!mv || !displayDish?.modelSrc) return

    const onLoad = () => {
      // Brief delay so model-viewer completes its AR capability check
      setTimeout(() => {
        setScanState(mv.canActivateAR !== false ? 'ready' : 'unsupported')
      }, 150)
    }

    const onArStatus = (e) => {
      const { status } = e.detail
      if (status === 'session-started' || status === 'object-placed') {
        setScanState('launched')
        setArLaunching(false)
      }
      if (status === 'not-presenting') {
        // User exited AR — reset so they can relaunch
        setScanState('ready')
      }
      if (status === 'failed') {
        setScanState('unsupported')
        setArLaunching(false)
      }
    }

    const onError = (e) => {
      console.error('model-viewer error:', e)
      setModelError('Failed to load: ' + (displayDish.modelSrc || 'unknown url'))
      setScanState('unsupported')
    }

    mv.addEventListener('load', onLoad)
    mv.addEventListener('ar-status', onArStatus)
    mv.addEventListener('error', onError)
    return () => {
      mv.removeEventListener('load', onLoad)
      mv.removeEventListener('ar-status', onArStatus)
      mv.removeEventListener('error', onError)
    }
  }, [displayDish?.id])

  const handleLaunchAR = useCallback(() => {
    const mv = modelRef.current
    if (!mv) return
    setArLaunching(true)
    try {
      mv.activateAR()
      // Scene Viewer / Quick Look open as external views.
      // Reset launching spinner after 3s in case no ar-status event fires.
      setTimeout(() => setArLaunching(false), 3000)
    } catch {
      setScanState('unsupported')
      setArLaunching(false)
    }
  }, [])

  const hasModel = !!displayDish?.modelSrc

  // ── Derived label strings ────────────────────────────────────────────────
  const instructionText = modelError ? modelError : {
    loading:     'Loading 3D model…',
    ready:       'Point your camera at a flat surface\nto place the dish on your table',
    unsupported: 'AR is not supported on this device.\nTry opening on a mobile phone.',
    launched:    'Dish placed! Exit AR to return here.',
  }[scanState] ?? ''

  const buttonLabel = arLaunching
    ? 'Opening camera…'
    : scanState === 'launched'
    ? '↩ Place Again'
    : 'Place on Your Table'

  const buttonDisabled =
    !hasModel || scanState === 'loading' || scanState === 'unsupported'

  return (
    <>
      {/* Desktop backdrop */}
      <div
        className={`ar-backdrop${isOpen ? ' ar-backdrop--open' : ''}`}
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Slide-up overlay */}
      <div
        className={`ar-overlay${isOpen ? ' ar-overlay--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={`AR launcher for ${displayDish?.name ?? 'item'}`}
      >
        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span
              style={{
                fontFamily: 'var(--theme-font)',
                fontSize: '17px',
                fontWeight: 700,
                color: 'var(--theme-text)',
                letterSpacing: '-0.3px',
              }}
            >
              {displayDish?.name}
            </span>
            <span
              style={{
                fontFamily: 'var(--theme-font)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--accent-color, #f59e0b)',
              }}
            >
              {displayDish?.price}
            </span>
          </div>

          <button
            id="ar-close-button"
            aria-label="Close AR viewer"
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--theme-text-muted)',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              outline: 'none',
              flexShrink: 0,
              transition: 'background 0.15s, color 0.15s',
              fontFamily: 'var(--theme-font)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.12)'
              e.currentTarget.style.color = 'var(--theme-text)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = 'var(--theme-text-muted)'
            }}
          >
            ✕
          </button>
        </div>

        {/* ── Main content (3D Model + AR Button) ─────────────────────────── */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            background: 'radial-gradient(ellipse at 50% 45%, rgba(var(--accent-color-rgb, 245,158,11),0.08) 0%, var(--theme-bg) 70%)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top subtle instruction */}
          <div style={{ position: 'absolute', top: '16px', left: 0, right: 0, textAlign: 'center', zIndex: 5, pointerEvents: 'none' }}>
            <span
              style={{
                fontFamily: 'var(--theme-font)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--theme-text-muted)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              {hasModel ? 'Interactive 3D Preview' : ''}
            </span>
          </div>

          {/* 3D Model Canvas (Always visible) */}
          <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: 0 }}>
            {hasModel ? (
              <model-viewer
                ref={modelRef}
                src={displayDish.modelSrc}
                ios-src={displayDish.iosSrc}
                ar
                ar-modes="webxr scene-viewer quick-look"
                camera-controls
                auto-rotate
                rotation-per-second="15deg"
                interaction-prompt="none"
                loading="eager"
                style={{ width: '100%', height: '100%', display: 'block', '--poster-color': 'transparent' }}
              />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--theme-text-muted)', fontSize: '14px', fontFamily: 'var(--theme-font)' }}>
                3D model coming soon
              </div>
            )}
            
            {/* Subtle pedestal glow under the model to anchor it visually */}
            {hasModel && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '15%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '200px',
                  height: '24px',
                  background: 'rgba(var(--accent-color-rgb, 245,158,11),0.15)',
                  filter: 'blur(20px)',
                  borderRadius: '50%',
                  pointerEvents: 'none',
                  zIndex: -1,
                }}
              />
            )}
          </div>

          {/* Bottom Actions Overlay (Gradient faded) */}
          <div
            style={{
              padding: '40px 20px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              background: 'linear-gradient(to top, rgba(10,10,10,1) 40%, rgba(10,10,10,0.85) 75%, transparent 100%)',
              position: 'relative',
              zIndex: 10,
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* Instruction text */}
            <p
              key={scanState}
              className="instr-enter"
              style={{
                fontFamily: 'var(--theme-font)',
                fontSize: '14px',
                fontWeight: 500,
                color: scanState === 'unsupported' ? '#ef4444' : 'var(--theme-text-muted)',
                textAlign: 'center',
                lineHeight: 1.6,
                whiteSpace: 'pre-line',
                maxWidth: '280px',
                margin: 0,
              }}
            >
              {hasModel ? instructionText : 'Select an item with a 3D model to place it on your table.'}
            </p>

            {/* Primary AR button */}
            {hasModel && (
              <button
                id="ar-launch-button"
                onClick={handleLaunchAR}
                disabled={buttonDisabled || arLaunching}
                style={{
                  width: '100%',
                  height: '56px',
                  borderRadius: '999px',
                  border: 'none',
                  background: buttonDisabled
                    ? 'rgba(var(--accent-color-rgb, 245,158,11),0.15)'
                    : scanState === 'launched'
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : 'var(--accent-color, #f59e0b)',
                  color: buttonDisabled ? 'var(--theme-text-muted)' : 'var(--theme-bg)',
                  fontFamily: 'var(--theme-font)',
                  fontSize: '16px',
                  fontWeight: 700,
                  letterSpacing: '-0.2px',
                  cursor: buttonDisabled || arLaunching ? 'not-allowed' : 'pointer',
                  boxShadow: buttonDisabled
                    ? 'none'
                    : scanState === 'launched'
                    ? '0 8px 28px rgba(34,197,94,0.35)'
                    : '0 8px 30px rgba(var(--accent-color-rgb, 245,158,11),0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  outline: 'none',
                  transition: 'background 0.3s, box-shadow 0.3s, transform 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!buttonDisabled) e.currentTarget.style.filter = 'brightness(1.08)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)'
                }}
                onMouseDown={(e) => {
                  if (!buttonDisabled) e.currentTarget.style.transform = 'scale(0.97)'
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                onTouchStart={(e) => {
                  if (!buttonDisabled) e.currentTarget.style.transform = 'scale(0.97)'
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {arLaunching ? (
                  <>
                    <span
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        border: '2px solid rgba(10,10,10,0.3)',
                        borderTopColor: 'var(--theme-bg)',
                        animation: 'spin 0.7s linear infinite',
                        flexShrink: 0,
                      }}
                    />
                    Opening camera…
                  </>
                ) : (
                  <>
                    {(!buttonDisabled && scanState !== 'launched') && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '-1px' }}>
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    )}
                    {buttonLabel}
                  </>
                )}
              </button>
            )}
              </div>
            </div>
        {/* Safe-area spacer */}
        <div
          style={{
            height: 'env(safe-area-inset-bottom, 0px)',
            backgroundColor: 'var(--theme-bg)',
            flexShrink: 0,
          }}
        />
      </div>

      {/* Inline spin keyframe (reused from App loading screen) */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
