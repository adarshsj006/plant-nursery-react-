import React from 'react';
import { useCart } from '../context/CartContext'; //Gets functions from global cart system (Context API).

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleIncrement = () => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrement = () => {
    updateQuantity(item.id, item.quantity - 1);
  };

  return (
    <div className="cart-item">
      <div className="cart-item-image">
        <img src={item.thumbnail} alt={item.title} />
      </div>
      
      <div className="cart-item-details">
        <h3 className="cart-item-title">{item.title}</h3>
        <p className="cart-item-category">{item.category}</p>
        <p className="cart-item-price">${item.price} each</p>
      </div>
      
      <div className="cart-item-quantity">
        <button 
          onClick={handleDecrement}
          className="quantity-btn"
        >
          -
        </button>
        <span className="quantity">{item.quantity}</span>
        <button 
          onClick={handleIncrement}
          className="quantity-btn"
        >
          +
        </button>
      </div>
      
      <div className="cart-item-total">
        <p className="item-total">Total: ${(item.price * item.quantity).toFixed(2)}</p>
      </div>
      
      <button 
        onClick={() => removeFromCart(item.id)}   //Deletes the item from the cart.
        className="remove-btn"
      >
        Remove
      </button>
    </div>
  );
};

export default CartItem;