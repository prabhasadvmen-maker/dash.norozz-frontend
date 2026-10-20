import { paymentService } from '../services/payment.service.js';

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

const loadCheckout = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector(`script[src="${CHECKOUT_SRC}"]`);
    const script = existing || document.createElement('script');
    script.addEventListener('load', () => resolve(true));
    script.addEventListener('error', () => reject(new Error('Could not load the payment window. Check your connection.')));
    if (!existing) {
      script.src = CHECKOUT_SRC;
      document.body.appendChild(script);
    }
  });

/**
 * Runs a full gateway payment: server order -> checkout -> server verification.
 * The amount is decided by the server for bookings (bookingId) and bounded for wallet recharges.
 * Resolves with the verify response, rejects with an Error (message safe to show) if the user cancels/fails.
 */
export const payWithGateway = async ({ type, bookingId, amount, user, description = 'NOROZZ' }) => {
  const orderRes = await paymentService.createOrder({ type, bookingId, amount });
  const order = orderRes.data || orderRes;

  // Local development without gateway keys: the server auto-accepts the simulated order
  if (order.mode === 'simulated') {
    return paymentService.verifyPayment({ transactionId: order.transactionId, paymentId: '', signature: '' });
  }

  await loadCheckout();

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: 'NOROZZ',
      description,
      prefill: { name: user?.name || '', email: user?.email || '', contact: user?.phone || '' },
      theme: { color: '#10b981' },
      handler: async (response) => {
        try {
          const verified = await paymentService.verifyPayment({
            transactionId: order.transactionId,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
          resolve(verified);
        } catch (err) {
          reject(new Error(err?.message || 'Payment verification failed'));
        }
      },
      modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
    });
    rzp.on('payment.failed', (resp) => reject(new Error(resp?.error?.description || 'Payment failed')));
    rzp.open();
  });
};
