import React from 'react';

const ProductDetailPage = () => {
 return (
  <div className="py-8">
   <h1 className="text-4xl font-bold text-center mb-8">Product Detail</h1>
   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    <div>
     <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop" alt="Product" className="w-full h-96 object-cover rounded-lg" />
    </div>
    <div>
     <h2 className="text-2xl font-bold mb-4">Burger</h2>
     <p className="text-gray-600 mb-4">A delicious burger with all the fixings</p>
     <p className="text-3xl font-bold mb-6">$10.00</p>
     <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
      Add to Cart
     </button>
    </div>
   </div>
  </div>
 );
};

export default ProductDetailPage;
