    import React, { useState, useMemo } from 'react'
    import data from '../../data.json'
const addToCart = (product) => addQuantity(product, 1)

    const CATEGORIES = ['All', 'Snacks', 'Salad', 'Bowls', 'Wraps']

    function getProductCategory(product) {
      const name = (product.product_name || '').toLowerCase()
      if (name.includes('salad')) return 'Salad'
      if (name.includes('bowl')) return 'Bowls'
      if (name.includes('wrap')) return 'Wraps'
      return 'Snacks'
    }

    export default function VendingPage({ onGoToPayment, onBackToHome }) {
    const [cart, setCart] = useState([])
    const [message, setMessage] = useState('')

    const products = useMemo(() => {
        return (data || []).slice(0, 36).map((p, idx) => ({
        id: p.product_id || idx,
        name: p.product_name || 'Unnamed',
        price: Number(p.product_price) || 0,
        image: p.image_mini || p.image || '',
        stock: p.stock ?? 10,
        category: getProductCategory(p)
        }))
    }, [])

    const addToCart = (product) => {
  setCart(prevCart => {
    const existing = prevCart.find(item => item.id === product.id)
    
    if (existing) {
      if (existing.quantity >= 5) {
        setMessage(`❌ Maximum 5 quantity for "${product.name}" reached`)
        alert(`⚠️ You can only add 5 of "${product.name}"!`)
        return prevCart
      }

      // Increment quantity by 1
      const newCart = prevCart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
      setMessage(`Added one more "${product.name}" (${existing.quantity + 1})`)
      return newCart
    }

    // New product addition
    if (prevCart.length >= 5) {
      setMessage('❌ Maximum 5 different products allowed in cart')
      alert('⚠️ You can only add maximum 5 different products to cart!')
      return prevCart
    }

    const categoryCount = prevCart.filter(item => item.category === product.category).length
    if (categoryCount >= 3) {
      setMessage(`❌ Maximum 3 products per category (${product.category}) reached`)
      alert(`⚠️ You can only add maximum 3 products from "${product.category}" category!`)
      return prevCart
    }

    setMessage(`Added "${product.name}" (x1) to cart`)
    return [...prevCart, { ...product, quantity: 1 }]
  })
}


    const removeFromCart = (productId) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId))
    }

    const updateQuantity = (productId, qty) => {
        if (qty <= 0) {
        removeFromCart(productId)
        } else if (qty > 5) {
        setMessage('❌ Maximum 5 quantity per product allowed')
        alert('⚠️ Maximum 5 quantity per product allowed!')
        } else {
        setCart(prevCart =>
            prevCart.map(item =>
            item.id === productId ? { ...item, quantity: qty } : item
            )
        )
        }
    }

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    return (
        <section className="vending-container">
        <div className="vending-header">
            <h2>Vending Machine</h2>
            <button className="btn-back" onClick={onBackToHome}>← Back</button>
        </div>

        {message && <div className="message success-msg">{message}</div>}

        <div className="vending-layout">
            {/* Products Section */}
            <div className="products-section">
            <h3>Select Items</h3>
            <div className="products-grid">
                {products.map(p => (
                <div key={p.id} className="product-card vending-product">
                    {p.image ? (
                    <img src={p.image} alt={p.name} />
                    ) : (
                    <div className="no-image">No Image</div>
                    )}
                    <div className="product-category-badge">{p.category}</div>
                    <div className="product-name">{p.name}</div>
                    <div className="product-meta">Rs. {p.price.toFixed(2)}</div>
                    <button
                    className="btn-add-cart"
                    onClick={() => addToCart(p)}
                    >
                    Add {cart.find(item => item.id === p.id)?.quantity ||"1"}
                    </button>
                </div>
                ))}
            </div>
            </div>

            {/* Cart Section */}
            <div className="cart-section">
            <h3>Cart ({cartCount})</h3>
            {cart.length === 0 ? (
                <p className="empty-cart">Cart is waiting for you !!</p>
            ) : (
                <>
                <div className="cart-items">
                    {cart.map(item => (
                    <div key={item.id} className="cart-item">
                        <div className="cart-item-info">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-price">${item.price.toFixed(2)} each</div>
                        </div>
                        <div className="cart-item-controls">
                        <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                            -
                        </button>
                        <span className="qty-display">{item.quantity}</span>
                        <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                            +
                        </button>
                        </div>
                        <div className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</div>
                        <button
                        className="btn-remove"
                        onClick={() => removeFromCart(item.id)}
                        >
                        ✕
                        </button>
                    </div>
                    ))}
                </div>

                <div className="cart-footer">
                    <div className="cart-total">
                    Total: <strong> Rs.{cartTotal.toFixed(2)}</strong>
                    </div>
                    <button
                    className="btn-checkout"
                    onClick={() => onGoToPayment(cart)}
                    >
                    Proceed to Payment
                    </button>
                </div>
                </>
            )}
            </div>
        </div>
        </section>
    )
    }
