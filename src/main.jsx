import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Async background import: This splits the massive 3D engine into a separate file
// so the restaurant menu UI loads instantly, and the 3D engine loads in the background!
import('@google/model-viewer').catch(console.error)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
