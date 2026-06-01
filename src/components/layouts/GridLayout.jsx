import React, { useState } from 'react'
import Header from '../Header'
import CategoryPills from '../CategoryPills'

export default function GridLayout({ restaurant, menuItems, theme, selectedDishId, onDishSelect }) {
  const categories = [...new Set(menuItems.map((i) => i.category))]
  const [activeCategory, setActiveCategory] = useState(categories[0] || null)
  
  const activeItems = activeCategory ? menuItems.filter((i) => i.category === activeCategory) : []

  return (
    <>
      <Header name={restaurant?.name} logo={restaurant?.logo} />
      <CategoryPills
        categories={categories}
        activeCategory={activeCategory}
        onSelect={setActiveCategory}
        style={{
          position: 'fixed',
          top: '75px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          zIndex: 40,
        }}
      />
      <div
        className="scrollbar-hide"
        style={{
          paddingTop: '134px', // header + pills
          paddingBottom: '100px',
          overflowY: 'auto',
          height: '100dvh',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          paddingLeft: '16px',
          paddingRight: '16px'
        }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          {activeItems.map(item => (
            <div
              key={item.id}
              onClick={() => onDishSelect(item)}
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderRadius: 'var(--theme-radius, 16px)',
                padding: '16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '100px',
                border: item.id === selectedDishId ? '2px solid var(--accent-color)' : '1px solid rgba(var(--theme-text-rgb, 255,255,255), 0.08)'
              }}
            >
              <span style={{ 
                fontFamily: 'var(--theme-font)', 
                fontSize: '15px', 
                fontWeight: 600, 
                color: 'var(--theme-text)', 
                lineHeight: 1.3 
              }}>
                {item.name}
              </span>
              <span style={{ 
                fontFamily: 'var(--theme-font)', 
                fontSize: '14px', 
                fontWeight: 700, 
                color: 'var(--accent-color)', 
                marginTop: '8px'
              }}>
                {item.price}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
