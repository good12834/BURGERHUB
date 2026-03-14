// frontend/src/components/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaShoppingCart } from 'react-icons/fa';

// Mapping of product slugs/names to Unsplash images for products with missing local images
const productImageMap = {
  // By slug
  'grilled-chicken': 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800&auto=format&fit=crop',
  'sweet-potato-fries': 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800&auto=format&fit=crop',
  'fresh-lemonade': 'https://images.unsplash.com/photo-1621265808019-0d582f9f5a4e?w=800&auto=format&fit=crop',
  'chocolate-brownie': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop',
  'classic-cheeseburger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop',
  'double-burger': 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800&auto=format&fit=crop',
  'bacon-deluxe': 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&auto=format&fit=crop',
  'crispy-chicken': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&auto=format&fit=crop',
  'veggie-delight': 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&auto=format&fit=crop',
  'mushroom-swiss': 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop',
  'french-fries': 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&auto=format&fit=crop',
  'onion-rings': 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=800&auto=format&fit=crop',
  'soft-drink': 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=800&auto=format&fit=crop',
  'milkshake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop',
  'apple-pie': 'https://images.unsplash.com/photo-1568571780765-9276ac8b75a2?w=800&auto=format&fit=crop',
  // By lowercase name (fallback)
  'grilled chicken': 'https://plus.unsplash.com/premium_photo-1722988828777-965588034b66?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  'sweet potato fries': 'https://images.unsplash.com/photo-1604909052743-94e838986d24?w=800&auto=format&fit=crop',
  'fresh lemonade': 'https://images.unsplash.com/photo-1621265808019-0d582f9f5a4e?w=800&auto=format&fit=crop',
  'chocolate brownie': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop',
  // By filename from database
  'lemonade': 'https://images.unsplash.com/photo-1621265808019-0d582f9f5a4e?w=800&auto=format&fit=crop',
  'brownie': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop',
};

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  // Handle image URLs - use a working fallback for all products with local /images paths
  const getImageSrc = () => {
    if (!product.image_url || product.image_url.length === 0) {
      return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop';
    }
    // If it's a local /images path, use a matching image from our map or default burger
    if (product.image_url.startsWith('/images')) {
      // Try lowercase name
      const nameKey = product.name?.toLowerCase().trim();
      if (nameKey && productImageMap[nameKey]) {
        return productImageMap[nameKey];
      }
      // Try filename from URL (e.g., "lemonade", "brownie")
      const filename = product.image_url.split('/').pop().replace('.jpg', '');
      if (productImageMap[filename]) {
        return productImageMap[filename];
      }
      // Default to burger image
      return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop';
    }
    // If it's an http URL, use it directly
    if (product.image_url.startsWith('http')) {
      return product.image_url;
    }
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop';
  };

  const imageSrc = getImageSrc();

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
      <Link to={`/product/${product.id}`}>
        <img
          src={imageSrc}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-xl font-bold mb-2 hover:text-primary transition">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary">
            ${product.price}
          </span>
          <button
            onClick={() => addToCart(product, 1)}
            className="bg-primary text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-primary/90 transition"
          >
            <FaShoppingCart />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
