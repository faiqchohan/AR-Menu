import React, { useState } from 'react'
import useRipple from '../hooks/useRipple'
import ViewportPreloader from './ViewportPreloader'

/**
 * Single menu item row: dish name (left) + price (right) with ripple on tap.
 */
function MenuItem({ item, index, onTap, isSelected }) {
  const createRipple = useRipple()
  const [isPressed, setIsPressed] = useState(false)

  const handlePointerDown = () => setIsPressed(true)
  const handlePointerUp = () => setIsPressed(false)

  const handleClick = (e) => {
    createRipple(e)
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 150)
    onTap(item)
  }

  return (
    <div
      className="ripple-container"
      role="button"
      tabIndex={0}
      id={`menu-item-${item.id}`}
      aria-label={`${item.name} – ${item.price}`}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick(e)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        background: isPressed ? 'var(--theme-surface-2)' : 'transparent',
      }}
      onMouseEnter={(e) => {
        if (!isPressed) e.currentTarget.style.background = 'rgba(var(--accent-color-rgb, 245,158,11), 0.04)'
      }}
      onMouseLeave={(e) => {
        if (!isPressed) e.currentTarget.style.background = 'transparent'
        handlePointerUp()
      }}
    >
      <ViewportPreloader modelSrc={item.modelSrc} />
      
      {/* Left: dish name */}
      <span
        style={{
          fontFamily: 'var(--theme-font)',
          fontSize: '16px',
          fontWeight: 500,
          color: 'var(--theme-text)',
          letterSpacing: '-0.1px',
          flexGrow: 1,
          marginRight: '12px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {isSelected && (
          <span style={{ color: 'var(--accent-color, #f59e0b)', fontSize: '18px', marginRight: '8px', lineHeight: 1 }}>•</span>
        )}
        {item.name}
      </span>

      {/* Right: price or arrow */}
      <span
        style={{
          fontFamily: 'var(--theme-font)',
          fontSize: '15px',
          fontWeight: 600,
          color: 'var(--accent-color, #f59e0b)',
          letterSpacing: '-0.2px',
          flexShrink: 0,
        }}
      >
        {isPressed ? '→' : item.price}
      </span>
    </div>
  )
}

/**
 * Full scrollable menu list for the active category.
 * onTap is forwarded from App so it can open the AR viewer.
 */
export default function MenuList({ items, activeCategory, onTap, selectedDishId }) {
  return (
    <div
      role="tabpanel"
      aria-labelledby={`tab-${activeCategory.toLowerCase()}`}
      className="menu-list-enter"
      style={{
        backgroundColor: 'var(--theme-surface)',
        borderRadius: '16px',
        margin: '16px 16px 0',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {items.map((item, index) => (
        <MenuItem
          key={item.id}
          item={item}
          index={index}
          isSelected={item.id === selectedDishId}
          onTap={onTap ?? ((it) => console.log(it.name))}
        />
      ))}
    </div>
  )
}
