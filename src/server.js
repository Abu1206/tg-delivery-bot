import express from 'express';
import { getOrderByReference, markOrderAsPaid } from './orders.js';
import { renderPaystackCheckoutHTML } from './paystack.js';
import { sendOrderConfirmationMessage } from './bot.js';

/**
 * Initializes Express Server for Webhook & Checkout Landing Page.
 * @param {number} port
 */
export function startServer(port) {
  const app = express();

  // Middleware for JSON & urlencoded forms
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // GET /checkout/:reference - Serves Mock Paystack Web Checkout Page
  app.get('/checkout/:reference', (req, res) => {
    const { reference } = req.params;
    const order = getOrderByReference(reference);

    if (!order) {
      return res.status(404).send('<h3>Error: Payment reference not found or expired.</h3>');
    }

    const html = renderPaystackCheckoutHTML(order);
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  });

  // POST /webhook/paystack - Webhook receiver for payment success simulation
  app.post('/webhook/paystack', async (req, res) => {
    const reference = req.body.reference || req.body.data?.reference;

    if (!reference) {
      return res.status(400).json({ status: false, message: 'Reference is required.' });
    }

    const order = getOrderByReference(reference);
    if (!order) {
      return res.status(404).json({ status: false, message: 'Order reference not found.' });
    }

    if (order.status === 'PAID') {
      return res.redirect(`/checkout/${reference}`);
    }

    // Mark order as paid
    const updatedOrder = markOrderAsPaid(order.orderId);

    // Notify Telegram Bot to send confirmation message
    try {
      await sendOrderConfirmationMessage(updatedOrder);
      console.log(`[Webhook] Order ${updatedOrder.orderId} marked as PAID. Telegram confirmation sent.`);
    } catch (err) {
      console.error(`[Webhook Error] Failed to send Telegram confirmation:`, err.message);
    }

    // Redirect to checkout page which will now render Success state
    if (req.headers['accept']?.includes('text/html') || req.headers['content-type']?.includes('application/x-www-form-urlencoded')) {
      return res.redirect(`/checkout/${reference}`);
    }

    return res.json({
      status: true,
      message: 'Payment simulation successful. Order confirmed.',
      data: updatedOrder,
    });
  });

  app.listen(port, () => {
    console.log(`🚀 Express server running at http://localhost:${port}`);
    console.log(`💳 Mock Paystack Webhook ready at http://localhost:${port}/webhook/paystack`);
  });
}
