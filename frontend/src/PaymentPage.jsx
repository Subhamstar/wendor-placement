import React, { useState } from 'react'

export default function PaymentPage({ cartItems, onBack, onConfirmPayment }) {
  const [processing, setProcessing] = useState(false)
  const [paid, setPaid] = useState(false)

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const handlePayment = () => {
    setProcessing(true)
    setTimeout(() => {
      setPaid(true)
      setProcessing(false)
      setTimeout(() => {
        onConfirmPayment()
      }, 2000)
    }, 1500)
  }

  if (paid) {
    return (
      <section className="payment-page">
        <div className="payment-success">
          <div className="success-box">
            <div className="checkmark">✓</div>
            <h2>Payment Successful!</h2>
            <p>Thank you for your purchase.</p>
          </div>
          <div className="order-id-box">
            <p className="order-label">Order ID</p>
            <p className="order-id">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="payment-page">
      <div className="payment-container">
        <h2>Order Summary</h2>
        
        <div className="cart-items-summary">
          {cartItems.map(item => (
            <div key={item.id} className="summary-item">
              <div className="item-details">
                <div className="item-name">{item.name}</div>
                <div className="item-qty">Qty: {item.quantity}</div>
              </div>
              <div className="item-price">Rs. {(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>

        <div className="payment-totals">
          <div className="total-row">
            <span>Subtotal</span>
            <span>Rs. {subtotal.toFixed(2)}</span>
          </div>
          <div className="total-row">
            <span>Tax (8%)</span>
            <span>Rs. {tax.toFixed(2)}</span>
          </div>
          <div className="total-row total-final">
            <span>Total</span>
            <span>Rs. {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="payment-buttons">
          <button className="btn-secondary" onClick={onBack} disabled={processing}>
            Back to Cart
          </button>
          <button 
            className="btn-primary" 
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? 'Processing...' : `Pay Rs. ${total.toFixed(2)}`}
          </button>
        </div>
      </div>
    </section>
  )
}
