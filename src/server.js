import express from 'express';
import { getOrderByReference, markOrderAsPaid } from './orders.js';
import { renderPaystackCheckoutHTML } from './paystack.js';
import { sendOrderConfirmationMessage } from './bot.js';

export function startServer(port) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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

    const updatedOrder = markOrderAsPaid(order.orderId);

    try {
      await sendOrderConfirmationMessage(updatedOrder);
      console.log(`[Webhook] Order ${updatedOrder.orderId} marked as PAID. Telegram confirmation sent.`);
    } catch (err) {
      console.error(`[Webhook Error] Failed to send Telegram confirmation:`, err.message);
    }

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
    console.log(`Express server running at http://localhost:${port}`);
    console.log(`Mock Paystack Webhook ready at http://localhost:${port}/webhook/paystack`);
  });
}

