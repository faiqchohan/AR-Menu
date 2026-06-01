import React, { useRef, useEffect } from 'react'

/**
 * Props:
 *  - categories     : string[]  — category names from API
 *  - activeCategory : string
 *  - onSelect       : (cat: string) => void
 */
export default function CategoryPills({ categories, activeCategory, onSelect, style }) {
  const rowRef = useRef(null)
  const activeRef = useRef(null)

  // Auto-scroll active pill into view
  useEffect(() => {
    if (activeRef.current && rowRef.current) {
      const row = rowRef.current
      const pill = activeRef.current
      const rowRect = row.getBoundingClientRect()
      const pillRect = pill.getBoundingClientRect()
      const offset = pillRect.left - rowRect.left - rowRect.width / 2 + pillRect.width / 2
      row.scrollBy({ left: offset, behavior: 'smooth' })
    }
  }, [activeCategory])

  return (
    <div
      style={{
        backgroundColor: 'var(--theme-bg)',
        paddingBottom: '12px',
        paddingTop: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        ...style
      }}
    >
      <div
        ref={rowRef}
        className="scrollbar-hide"
        style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingLeft: '20px',
          paddingRight: '20px',
        }}
        role="tablist"
        aria-label="Menu categories"
      >
        {categories.map((cat) => {
          const isActive = cat === activeCategory
          return (
            <button
              key={cat}
              ref={isActive ? activeRef : null}
              role="tab"
              aria-selected={isActive}
              id={`tab-${cat.toLowerCase()}`}
              onClick={() => onSelect(cat)}
              style={{
                flexShrink: 0,
                padding: '8px 20px',
                borderRadius: '999px',
                border: isActive ? '1.5px solid var(--accent-color, #f59e0b)' : '1.5px solid rgba(var(--accent-color-rgb, 245,158,11), 0.3)',
                background: isActive
                  ? 'var(--accent-color, #f59e0b)'
                  : 'transparent',
                color: isActive ? 'var(--theme-bg)' : 'var(--theme-text-muted)',
                fontFamily: 'var(--theme-font)',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '0.2px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                outline: 'none',
                WebkitAppearance: 'none',
                boxShadow: isActive ? '0 4px 16px rgba(var(--accent-color-rgb, 245,158,11), 0.25), 0 0 8px rgba(var(--accent-color-rgb, 245,158,11), 0.2)' : 'none',
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>
    </div>
  )
}
