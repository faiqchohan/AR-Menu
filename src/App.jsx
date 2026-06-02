import React, { useState, useEffect, useRef } from 'react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import FloatingButton from './components/FloatingButton'
import ARViewer from './components/ARViewer'
import { fetchMenu, fetchRestaurant } from './api'
import MinimalLayout from './components/layouts/MinimalLayout'
import GridLayout from './components/layouts/GridLayout'
import HeroLayout from './components/layouts/HeroLayout'

const layouts = {
  minimal: MinimalLayout,
  grid: GridLayout,
  hero: HeroLayout
}

// Fallback test model used only when an item has an empty modelSrc
const FALLBACK_GLB  = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'
const FALLBACK_USDZ = 'https://modelviewer.dev/shared-assets/models/Astronaut.usdz'

/**
 * Flatten grouped API response into a plain array and apply model fallbacks.
 */
function flattenMenu(menuByCategory) {
  return Object.values(menuByCategory).flat().map((item) => ({
    ...item,
    modelSrc: item.modelSrc ? item.modelSrc.replace('http://', 'https://') : FALLBACK_GLB,
    iosSrc:   item.iosSrc   ? item.iosSrc.replace('http://', 'https://')   : FALLBACK_USDZ,
  }))
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

// ── Loading screen ────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--theme-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: '3px solid rgba(var(--accent-color-rgb, 245,158,11), 0.15)',
          borderTopColor: 'var(--accent-color, #f59e0b)',
          animation: 'spin 0.85s linear infinite',
        }}
      />
      <p
        style={{
          fontFamily: 'var(--theme-font)',
          fontSize: '13px',
          color: 'var(--theme-text-muted)',
          letterSpacing: '0.3px',
        }}
      >
        Loading menu…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Error screen ──────────────────────────────────────────────────────────────
function ErrorScreen({ onRetry }) {
  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--theme-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
        padding: '0 32px',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: '40px', lineHeight: 1 }}>⚠️</span>
      <p
        style={{
          fontFamily: 'var(--theme-font)',
          fontSize: '15px',
          fontWeight: 500,
          color: 'var(--theme-text-muted)',
          lineHeight: 1.6,
        }}
      >
        Could not load menu. Please try again.
      </p>
      <button
        id="retry-button"
        onClick={onRetry}
        style={{
          padding: '13px 32px',
          borderRadius: 'var(--theme-radius, 999px)',
          border: 'none',
          background: 'linear-gradient(135deg, var(--accent-color, #f59e0b) 0%, rgba(var(--accent-color-rgb, 245,158,11), 0.8) 100%)',
          color: 'var(--theme-bg)',
          fontFamily: 'var(--theme-font)',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
          outline: 'none',
          letterSpacing: '0.1px',
          boxShadow: '0 6px 20px rgba(var(--accent-color-rgb, 245,158,11), 0.3)',
          transition: 'transform 0.15s, filter 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)' }}
        onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)' }}
        onMouseDown={(e)  => { e.currentTarget.style.transform = 'scale(0.97)' }}
        onMouseUp={(e)    => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        Retry
      </button>
    </div>
  )
}

// ── Not Found screen ──────────────────────────────────────────────────────────
function NotFoundScreen() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--theme-bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '0 32px',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: '48px', lineHeight: 1 }}>🍽️</span>
      <h2 style={{ fontFamily: 'var(--theme-font)', fontSize: '20px', fontWeight: 600, color: 'var(--theme-text)', margin: 0 }}>Restaurant not found</h2>
      <p style={{ fontFamily: 'var(--theme-font)', fontSize: '15px', color: 'var(--theme-text-muted)', margin: 0 }}>
        We couldn't find a menu for this URL.
      </p>
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [allItems,    setAllItems]    = useState([])
  const [restaurant,  setRestaurant]  = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(false)
  const [notFound,    setNotFound]    = useState(false)

  const [selectedDish,   setSelectedDish]   = useState(null)
  const [arOpen,         setArOpen]         = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(false)
    setNotFound(false)
    try {
      const pathSegments = window.location.pathname.split('/').filter(Boolean)
      const slug = pathSegments.length > 0 ? pathSegments[0] : 'burger-lab'
      
      const rest = await fetchRestaurant(slug)
      if (!rest) {
        setNotFound(true)
        setLoading(false)
        return
      }
      
      // Setup dynamic CSS variables for theming
      if (rest.theme) {
        const root = document.documentElement.style;
        const t = rest.theme;
        
        if (t.primaryColor) {
          root.setProperty('--accent-color', t.primaryColor);
          const rgb = hexToRgb(t.primaryColor);
          if (rgb) root.setProperty('--accent-color-rgb', rgb);
        }
        if (t.backgroundColor) root.setProperty('--theme-bg', t.backgroundColor);
        if (t.surfaceColor) root.setProperty('--theme-surface', t.surfaceColor);
        if (t.textColor) {
          root.setProperty('--theme-text', t.textColor);
          const rgb = hexToRgb(t.textColor);
          if (rgb) root.setProperty('--theme-text-rgb', rgb);
        }
        if (t.borderRadius) root.setProperty('--theme-radius', t.borderRadius);
        if (t.logoShape) root.setProperty('--theme-logo-shape', t.logoShape === 'square' ? '8px' : '50%');
        
        if (t.font) {
          const fontUrl = `https://fonts.googleapis.com/css2?family=${t.font.replace(/\s+/g, '+')}:wght@400;500;600;700;800&display=swap`;
          let fontLink = document.querySelector(`link[href^="https://fonts.googleapis.com/css2"]`);
          if (!fontLink) {
            fontLink = document.createElement('link');
            fontLink.rel = 'stylesheet';
            document.head.appendChild(fontLink);
          }
          fontLink.href = fontUrl;
          root.setProperty('--theme-font', `'${t.font}', sans-serif`);
        }
      }

      const menuRaw = await fetchMenu(rest.id)
      
      // Update Document Title and Favicon
      if (rest) {
        if (rest.name) {
          document.title = `${rest.name} | AR Menu`
        }
        if (rest.logo) {
          let link = document.querySelector("link[rel~='icon']")
          if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.getElementsByTagName('head')[0].appendChild(link)
          }
          link.href = rest.logo
        }
      }

      const flat = flattenMenu(menuRaw)
      setAllItems(flat)
      setRestaurant(rest)
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  // Background preloader: Download all 3D models into the browser cache
  // so they open instantly the moment a user taps on them.
  useEffect(() => {
    if (allItems.length === 0) return
    
    const modelsToPreload = [...new Set(allItems.map(item => item.modelSrc).filter(src => src && src !== FALLBACK_GLB))]

    modelsToPreload.forEach(src => {
      if (!document.querySelector(`link[href="${src}"]`)) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'fetch'
        link.crossOrigin = 'anonymous'
        link.href = src
        document.head.appendChild(link)
      }
    })
  }, [allItems])

  const handleDishTap = (dish) => {
    console.log(dish.name)
    setSelectedDish(dish)
    setArOpen(true)
  }

  const [toastMessage, setToastMessage] = useState('')
  const toastTimeoutRef = useRef(null)

  const handleARPress = () => {
    if (selectedDish) {
      setArOpen(true)
    } else {
      setToastMessage("👆 Tap an item you'd like to see!")
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      toastTimeoutRef.current = setTimeout(() => {
        setToastMessage('')
      }, 3000)
    }
  }

  const handleClose = () => setArOpen(false)

  if (loading) return <LoadingScreen />
  if (notFound) return <NotFoundScreen />
  if (error)   return <ErrorScreen onRetry={loadData} />

  const LayoutComponent = layouts[restaurant?.layout] || MinimalLayout;

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundColor: 'var(--theme-bg)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '480px',
          minHeight: '100dvh',
          backgroundColor: 'var(--theme-bg)',
          overflowX: 'hidden',
        }}
      >
        <LayoutComponent 
          restaurant={restaurant}
          menuItems={allItems}
          theme={restaurant?.theme}
          selectedDishId={selectedDish?.id}
          onDishSelect={handleDishTap}
        />

        {/* ── Sleek Toast Notification ── */}
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: `translateX(-50%) translateY(${toastMessage ? '0' : '20px'})`,
            opacity: toastMessage ? 1 : 0,
            pointerEvents: 'none',
            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            color: '#000',
            padding: '10px 20px',
            borderRadius: '30px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 60,
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {toastMessage}
        </div>

        {/* ── Floating AR button ── */}
        <FloatingButton
          onPress={handleARPress}
          hasSelection={!!selectedDish}
        />

        {/* ── AR Viewer overlay ── */}
        <ARViewer
          dish={selectedDish}
          isOpen={arOpen}
          onClose={handleClose}
        />
        
        {/* ── Vercel Speed Insights ── */}
        <SpeedInsights />
      </div>
    </div>
  )
}
