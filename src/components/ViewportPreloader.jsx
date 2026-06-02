import React, { useEffect, useRef, useState } from 'react'

const FALLBACK_GLB  = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb'

export default function ViewportPreloader({ modelSrc }) {
  const ref = useRef(null)
  const [shouldPreload, setShouldPreload] = useState(false)

  useEffect(() => {
    // Skip if there's no model, if it's the fallback, or if we already triggered it
    if (!modelSrc || modelSrc === FALLBACK_GLB || shouldPreload) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldPreload(true)
          observer.disconnect()
        }
      },
      // Trigger preload when the item is within 400px of entering the viewport!
      // This ensures it downloads slightly *before* the user even sees it.
      { rootMargin: '400px 0px' }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [modelSrc, shouldPreload])

  useEffect(() => {
    if (shouldPreload && modelSrc) {
      // Prevent duplicate link tags in the head if multiple items share a model
      if (!document.querySelector(`link[href="${modelSrc}"]`)) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'fetch'
        link.crossOrigin = 'anonymous'
        link.href = modelSrc
        document.head.appendChild(link)
      }
    }
  }, [shouldPreload, modelSrc])

  // Returns an invisible 0x0 element physically located inside the menu item card
  // This is what the browser "looks" for when scrolling!
  return <span ref={ref} aria-hidden="true" style={{ display: 'block', width: 0, height: 0, opacity: 0, pointerEvents: 'none', position: 'absolute' }} />
}
