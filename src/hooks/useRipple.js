import React, { useCallback } from 'react'

/**
 * Attaches a ripple wave to the element that was tapped/clicked.
 * Returns a click handler that can be spread onto any element.
 */
export function useRipple() {
  const createRipple = useCallback((e) => {
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = (e.clientX || e.touches?.[0]?.clientX || rect.left + rect.width / 2) - rect.left - size / 2
    const y = (e.clientY || e.touches?.[0]?.clientY || rect.top + rect.height / 2) - rect.top - size / 2

    const ripple = document.createElement('span')
    ripple.className = 'ripple-wave'
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`
    el.appendChild(ripple)
    ripple.addEventListener('animationend', () => ripple.remove())
  }, [])

  return createRipple
}

export default useRipple
