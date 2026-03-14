
import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useAuth } from "../context/AuthContext";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || "");

// Payment form component
const PaymentForm = ({ items, subtotal, delivery, total, onSuccess, orderId }) => {
 const stripe = useStripe();
 const elements = useElements();
 const [processing, setProcessing] = useState(false);
 const [error, setError] = useState(null);
 const [clientSecret, setClientSecret] = useState(null);
 const { token } = useAuth();

 // Create payment intent with actual amount
 const createPaymentIntent = async () => {
  try {
   // Calculate total from items if not provided
   const orderTotal = total || (items?.reduce((sum, item) => {
    return sum + (item.quantity * (item.price || item.unit_price || 0));
   }, 0) || 0);

   const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/payment/create-payment-intent`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
     orderId: orderId || 'temp',
     amount: orderTotal,
     items: items || []
    })
   });
   const data = await response.json();
   if (data.success) {
    setClientSecret(data.data.clientSecret);
   } else {
    setError(data.message || 'Failed to create payment intent');
   }
  } catch (err) {
   setError('Error creating payment intent');
   console.error('Payment intent error:', err);
  }
 };

 // Handle form submission
 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!stripe || !elements) return;

  setProcessing(true);
  setError(null);

  try {
   const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
     card: elements.getElement(CardElement),
     billing_details: {
      name: 'Customer Name',
     },
    },
   });

   if (error) {
    setError(error.message);
    setProcessing(false);
   } else if (paymentIntent) {
    // Confirm payment
    await confirmPayment(paymentIntent.id);
   }
  } catch (err) {
   setError('Payment processing failed');
   setProcessing(false);
   console.error('Payment error:', err);
  }
 };

 // Confirm payment with backend
 const confirmPayment = async (paymentIntentId) => {
  try {
   const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8000'}/api/payment/confirm`, {
    method: 'POST',
    headers: {
     'Content-Type': 'application/json',
     'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ paymentIntentId })
   });
   const data = await response.json();

   if (data.success) {
    // If orderId is available, include it in the success data
    const successData = orderId ? { ...data.data, orderId } : data.data;
    onSuccess(successData);
   } else {
    setError(data.message || 'Payment confirmation failed');
    setProcessing(false);
   }
  } catch (err) {
   setError('Error confirming payment');
   setProcessing(false);
   console.error('Confirm payment error:', err);
  }
 };

 useEffect(() => {
  createPaymentIntent();
 }, []);

 return (
  <div style={{ maxWidth: 500, margin: '0 auto' }}>
   <form onSubmit={handleSubmit}>
    <div style={{ marginBottom: 20 }}>
     <CardElement
      options={{
       style: {
        base: {
         fontSize: '16px',
         color: '#424770',
         '::placeholder': {
          color: '#aab7c4',
         },
        },
        invalid: {
         color: '#9e2146',
        },
       },
      }}
     />
    </div>

    {error && (
     <div style={{ color: '#ef4444', marginBottom: 12, fontSize: 14 }}>
      {error}
     </div>
    )}

    <button
     type="submit"
     disabled={!stripe || processing || !clientSecret}
     style={{
      width: '100%',
      padding: '12px',
      background: processing ? '#9ca3af' : '#F59E0B',
      color: 'white',
      border: 'none',
      borderRadius: 8,
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      opacity: processing ? 0.6 : 1,
     }}
    >
     {processing ? 'Processing...' : 'Pay Now'}
    </button>
   </form>
  </div>
 );
};

// Wrapper component with Elements context
const StripePayment = ({ items, subtotal, delivery, total, onSuccess, orderId }) => {
 return (
  <Elements stripe={stripePromise}>
   <PaymentForm
    items={items}
    subtotal={subtotal}
    delivery={delivery}
    total={total}
    onSuccess={onSuccess}
    orderId={orderId}
   />
  </Elements>
 );
};

export default StripePayment;