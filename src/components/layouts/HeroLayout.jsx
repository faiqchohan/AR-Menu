import React, { useState } from 'react'
import CategoryPills from '../CategoryPills'

export default function HeroLayout({ restaurant, menuItems, theme, selectedDishId, onDishSelect }) {
  const categories = [...new Set(menuItems.map((i) => i.category))]
  const [activeCategory, setActiveCategory] = useState(categories[0] || null)
  
  const activeItems = activeCategory ? menuItems.filter((i) => i.category === activeCategory) : []

  return (
    <div
      className="scrollbar-hide"
      style={{
        overflowY: 'auto',
        height: '100dvh',
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '100px',
      }}
    >
      {/* Massive Hero Section */}
      <div style={{
        padding: '60px 24px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        borderBottom: '1px solid rgba(var(--theme-text-rgb, 255,255,255), 0.08)',
        marginBottom: '0px'
      }}>
        {restaurant?.logo && (
          <img 
            src={restaurant.logo} 
            alt="Logo" 
            style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: 'var(--theme-logo-shape, 50%)', 
              marginBottom: '20px',
              boxShadow: '0 8px 24px rgba(var(--accent-color-rgb), 0.3)'
            }} 
          />
        )}
        <h1 style={{
          fontFamily: 'var(--theme-font)',
          fontSize: '42px',
          fontWeight: 900,
          color: 'var(--theme-text)',
          lineHeight: 1.1,
          letterSpacing: '-1px',
          marginBottom: '4px'
        }}>
          {restaurant?.name}
        </h1>
        <p style={{
          fontFamily: 'var(--theme-font)',
          fontSize: '14px',
          fontWeight: 600,
          color: 'var(--accent-color)',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
        }}>
          AR Menu
        </p>
      </div>

      <CategoryPills
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          width: '100%',
        }}
      />

      {/* List */}
      <div style={{ padding: '24px 16px 0 16px' }}>
        <div style={{
          backgroundColor: 'var(--theme-surface)',
          borderRadius: 'var(--theme-radius, 16px)',
          overflow: 'hidden',
          border: '1px solid rgba(var(--theme-text-rgb, 255,255,255), 0.06)'
        }}>
          {activeItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => onDishSelect(item)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                cursor: 'pointer',
                borderBottom: index < activeItems.length - 1 ? '1px solid rgba(var(--theme-text-rgb, 255,255,255), 0.08)' : 'none',
                backgroundColor: item.id === selectedDishId ? 'var(--theme-surface-2)' : 'transparent'
              }}
            >
              <span style={{ 
                fontFamily: 'var(--theme-font)', 
                fontSize: '17px', 
                fontWeight: 500, 
                color: 'var(--theme-text)',
                display: 'flex',
                alignItems: 'center'
              }}>
                {item.id === selectedDishId && <span style={{ color: 'var(--accent-color)', marginRight: '8px' }}>•</span>}
                {item.name}
              </span>
              <span style={{ 
                fontFamily: 'var(--theme-font)', 
                fontSize: '16px', 
                fontWeight: 700, 
                color: 'var(--accent-color)' 
              }}>
                {item.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
