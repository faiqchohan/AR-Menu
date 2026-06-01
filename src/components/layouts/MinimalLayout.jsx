import React, { useState } from 'react'
import Header from '../Header'
import CategoryPills from '../CategoryPills'
import MenuList from '../MenuList'

export default function MinimalLayout({ restaurant, menuItems, theme, selectedDishId, onDishSelect }) {
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
          paddingTop: '134px',
          paddingBottom: '100px',
          overflowY: 'auto',
          height: '100dvh',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <MenuList
          key={activeCategory}
          items={activeItems}
          activeCategory={activeCategory}
          selectedDishId={selectedDishId}
          onTap={onDishSelect}
        />
        <div style={{ height: '24px' }} />
      </div>
    </>
  )
}
