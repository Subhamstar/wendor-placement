import React from 'react'

export default function Header({ onNavigate = () => {}, pickupCode = 'Pick Up Code' }) {
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(pickupCode)
      // feedback could be added
    } catch {
      // ignore copy errors in older browsers
    }
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="logo-badge">W</div>
        <div className="brand">
          {/* <div className="brand-name">Wendor</div>
          <div className="brand-sub">Kiosk</div> */}
        </div>
      </div>

      <nav className="header-center">
        {/* <button className="nav-btn" onClick={() => onNavigate('home')}>Home</button> */}
        <button className="nav-btn" onClick={() => onNavigate('vending')}>Vending</button>
      </nav>

      <div className="header-right">
        {/* <div className="pickup">Pickup code</div> */}
        <div className="Pick Up Code" onClick={copyCode} title="Click to copy">
          {pickupCode}
        </div>
      </div>
    </header>
  )
}
