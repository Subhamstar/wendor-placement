import './App.css'
import { useState } from 'react'
import Header from './Header'
import Home from './Home'
import VendingPage from './VendingPage'
import PaymentPage from './PaymentPage'

export default function App() {
  const [view, setView] = useState('vending')
  const [cart, setCart] = useState([])

  const handleGoToPayment = (cartItems) => {
    setCart(cartItems)
    setView('payment')
  }

  const handleConfirmPayment = () => {
    setCart([])
    setView('vending')
  }

  return (
    <div>
      <Header
        onNavigate={(v) => setView(v)}
        // pickupCode="PX-1234"    
      />

      <main>
        {view === 'home' ? (
          <Home onOpenVending={() => setView('vending')} />
        ) : view === 'vending' ? (
          <VendingPage 
            onGoToPayment={handleGoToPayment}
            onBackToHome={() => setView('home')}
          />
        ) : (
          <PaymentPage 
            cartItems={cart}
            onBack={() => setView('vending')}
            onConfirmPayment={handleConfirmPayment}
          />
        )}
      </main>
    </div>
  )
}
