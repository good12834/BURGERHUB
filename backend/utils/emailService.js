const sendOrderConfirmation = async (email, order) => {
    console.log(`Sending order confirmation to ${email} for order ${order.order_number}`);
    // Implement actual email sending here
};

const sendDeliveryUpdate = async (email, order, status) => {
    console.log(`Sending delivery update to ${email} for order ${order.order_number}: ${status}`);
    // Implement actual email sending here
};

module.exports = { sendOrderConfirmation, sendDeliveryUpdate };