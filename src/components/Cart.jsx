import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Cart = ({ cart, updateQuantity, removeFromCart, getCartTotal }) => {
  const navigate = useNavigate();
  const [checkoutProcessing, setCheckoutProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const handleCheckout = () => {    //Function to handle checkout.
    if (cart.length === 0) return; //Stop if cart is empty.
    
    setCheckoutProcessing(true); //Show processing state.
    // Simulate checkout process
    setTimeout(() => {     //Wait for 2 seconds (fake process).
      setCheckoutProcessing(false); //.Stop processing.
      setOrderPlaced(true); //Mark order as placed.
     
      alert('Order placed successfully! In a real application, this would redirect to payment.');
    }, 2000);
  };

  if (cart.length === 0) {//Check if cart is empty.
    return (                                 //Show empty cart UI.
      <div className="cart-container">
        <h1>Your Shopping Cart</h1>
        <div className="empty-cart">
          <i className="fas fa-shopping-cart"></i>
          <h2>Your cart is empty</h2>
          <p>Add some beautiful plants to your cart!</p>
          <button 
            className="btn" 
            onClick={() => navigate('/plants')}
            style={{ marginTop: '2rem', maxWidth: '300px' }}
          >
            <i className="fas fa-store"></i> Browse Plants
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Your Shopping Cart</h1>
      
      {orderPlaced && (          //Show success box only if order placed.
        <div style={{
          background: '#e8f5e9',
          color: '#2e7d32',
          padding: '1.5rem',
          borderRadius: '10px',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          <h3><i className="fas fa-check-circle"></i> Order Placed Successfully!</h3>
          <p>Thank you for your order. You will receive a confirmation email shortly.</p>
        </div>
      )}
      
      <div className="cart-items">
        {cart.map(item => (       //Loop through each cart item.
          <div key={item.id} className="cart-item">
            <img src={item.image} alt={item.name} className="cart-item-image" />
            
            <div className="cart-item-details">
              <h3>{item.name}</h3>
              <div className="cart-item-price">${item.price.toFixed(2)} each</div>
              <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                {item.category} • {item.difficulty}
              </p>
            </div>
            
            <div className="quantity-controls">
              <button 
                className="quantity-btn"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                -
              </button>
              <span className="quantity-display">{item.quantity}</span>
              <button 
                className="quantity-btn"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>
            
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
              ${(item.price * item.quantity).toFixed(2)}
            </div>
            
            <button 
              className="remove-btn"
              onClick={() => removeFromCart(item.id)}
            >
              <i className="fas fa-trash"></i> Remove
            </button>
          </div>
        ))}
      </div>
      
      <div className="cart-summary">
        <h2>Order Summary</h2>
        
        <div className="summary-row">
          <span>Subtotal ({cart.reduce((total, item) => total + item.quantity, 0)} items)</span>
          <span>${getCartTotal().toFixed(2)}</span>
        </div>
        
        <div className="summary-row">
          <span>Shipping</span>
          <span>{getCartTotal() > 50 ? 'FREE' : '$5.99'}</span>
        </div>
        
        <div className="summary-row">
          <span>Tax (8%)</span>
          <span>${(getCartTotal() * 0.08).toFixed(2)}</span>
        </div>
        
        <div className="summary-row total">
          <span>Total</span>
          <span>
            ${(getCartTotal() + (getCartTotal() > 50 ? 0 : 5.99) + (getCartTotal() * 0.08)).toFixed(2)}
          </span>
        </div>
        
        <div style={{ 
          background: '#f0f7f0', 
          padding: '1rem', 
          borderRadius: '8px',
          marginTop: '1rem'
        }}>
          <p style={{ color: '#2e7d32', marginBottom: '0.5rem' }}>
            <i className="fas fa-truck"></i> Free shipping on orders over $50
          </p>
          {getCartTotal() < 50 && (
            <p style={{ color: '#666' }}>
              Add ${(50 - getCartTotal()).toFixed(2)} more to get free shipping!
            </p>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/plants')}
            style={{ flex: 1 }}
          >
            <i className="fas fa-store"></i> Continue Shopping
          </button>
          
          <button 
            className="btn"
            onClick={handleCheckout}
            disabled={checkoutProcessing || orderPlaced}
            style={{ flex: 1 }}
          >
            {checkoutProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Processing...
              </>
            ) : orderPlaced ? (
              <>
                <i className="fas fa-check"></i> Order Placed
              </>
            ) : (
              <>
                <i className="fas fa-lock"></i> Proceed to Checkout
              </>
            )}
          </button>
        </div>
        
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#f5f5f5', 
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <h4><i className="fas fa-shield-alt"></i> Secure Checkout</h4>
          <p>Your payment information is encrypted and secure. We never store your credit card details.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <i className="fab fa-cc-visa" style={{ fontSize: '2rem', color: '#1a1f71' }}></i>
            <i className="fab fa-cc-mastercard" style={{ fontSize: '2rem', color: '#eb001b' }}></i>
            <i className="fab fa-cc-amex" style={{ fontSize: '2rem', color: '#2e77bc' }}></i>
            <i className="fab fa-cc-paypal" style={{ fontSize: '2rem', color: '#003087' }}></i>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;