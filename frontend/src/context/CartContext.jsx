// frontend/src/context/CartContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        return parsedCart;
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        return [];
      }
    }
    return [];
  });
  const [cartTotal, setCartTotal] = useState(0);

  useEffect(() => {
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cartItems));

    // Calculate total
    const total = cartItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
    setCartTotal(total);
  }, [cartItems]);

  const addToCart = (product, quantity = 1, customizations = { addons: [], size: 'single' }) => {
    setCartItems(prevItems => {
      // Create a unique key for the item based on ID and customizations
      const itemKey = JSON.stringify({ id: product.id, customizations });

      const existingItem = prevItems.find(item =>
        JSON.stringify({ id: item.id, customizations: item.customizations || {} }) === itemKey
      );

      if (existingItem) {
        return prevItems.map(item =>
          JSON.stringify({ id: item.id, customizations: item.customizations || {} }) === itemKey
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...prevItems, {
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: (product.image_url && product.image_url.length > 0 && !product.image_url.startsWith('/images') && product.image_url.startsWith('http')) ? product.image_url : (product.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop'),
        quantity,
        customizations: {
          addons: customizations.addons || [],
          size: customizations.size || 'single'
        },
        maxQuantity: 10
      }];
    });

    toast.success('Added to cart!');
  };

  const removeFromCart = (itemId, customizations = {}) => {
    setCartItems(prevItems =>
      prevItems.filter(item =>
        !(item.id === itemId && JSON.stringify(item.customizations) === JSON.stringify(customizations))
      )
    );
    toast.success('Removed from cart');
  };

  const updateQuantity = (itemId, newQuantity, customizations = {}) => {
    if (newQuantity < 1) {
      removeFromCart(itemId, customizations);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId && JSON.stringify(item.customizations) === JSON.stringify(customizations)
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.setItem('cart', JSON.stringify([]));
  };

  const value = {
    cartItems,
    cartTotal,
    cartCount: cartItems.length,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};