import config from './config.js';

/**
 * Generates a mock Paystack payment link for an order.
 * @param {object} order
 * @returns {string} Payment URL
 */
export function generatePaystackPaymentLink(order) {
  // Generates link pointing to our Express server mock payment endpoint
  return `${config.BASE_URL}/checkout/${order.paymentReference}`;
}

/**
 * Renders an HTML page simulating the Paystack Checkout Interface.
 * @param {object} order
 * @returns {string} HTML Content
 */
export function renderPaystackCheckoutHTML(order) {
  const isPaid = order.status === 'PAID';
  const amountFormatted = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(order.totalAmount);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Paystack Mock Checkout - ${order.orderId}</title>
  <style>
    :root {
      --paystack-blue: #09a5db;
      --paystack-dark: #011b33;
      --bg-color: #f4f7f9;
      --card-bg: #ffffff;
      --text-color: #1a202c;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-color);
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    .checkout-card {
      background: var(--card-bg);
      width: 100%;
      max-width: 420px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      overflow: hidden;
      margin: 20px;
    }
    .header {
      background: var(--paystack-dark);
      color: #ffffff;
      padding: 24px;
      text-align: center;
      position: relative;
    }
    .badge {
      display: inline-block;
      background: rgba(9, 165, 219, 0.2);
      color: var(--paystack-blue);
      border: 1px solid var(--paystack-blue);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .amount {
      font-size: 2rem;
      font-weight: 700;
      margin: 8px 0 0 0;
    }
    .body {
      padding: 24px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #edf2f7;
      font-size: 0.95rem;
    }
    .info-label {
      color: #718096;
    }
    .info-value {
      font-weight: 600;
      color: var(--text-color);
      text-align: right;
    }
    .btn-pay {
      display: block;
      width: 100%;
      background: var(--paystack-blue);
      color: white;
      text-align: center;
      padding: 14px;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 24px;
      transition: background 0.2s ease;
      text-decoration: none;
    }
    .btn-pay:hover {
      background: #088dbb;
    }
    .success-box {
      text-align: center;
      padding: 20px 0;
    }
    .success-icon {
      font-size: 3rem;
      margin-bottom: 8px;
    }
    .footer {
      text-align: center;
      font-size: 0.75rem;
      color: #a0aec0;
      padding-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="checkout-card">
    <div class="header">
      <div class="badge">Paystack Mock Merchant</div>
      <div class="amount">${amountFormatted}</div>
      <p style="margin: 4px 0 0 0; font-size: 0.85rem; color: #a0aec0;">Ref: ${order.paymentReference}</p>
    </div>
    <div class="body">
      ${
        isPaid
          ? `
        <div class="success-box">
          <div class="success-icon">✅</div>
          <h3 style="color: #2f855a; margin: 0 0 8px 0;">Payment Successful!</h3>
          <p style="color: #4a5568; font-size: 0.9rem;">Your order has been confirmed and sent to the Telegram bot.</p>
        </div>
      `
          : `
        <div class="info-row">
          <span class="info-label">Order ID</span>
          <span class="info-value">${order.orderId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Food Item</span>
          <span class="info-value">${order.item}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Vendor</span>
          <span class="info-value">${order.vendor ? order.vendor.name : 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Delivery Location</span>
          <span class="info-value">${order.location}</span>
        </div>

        <form action="/webhook/paystack" method="POST">
          <input type="hidden" name="reference" value="${order.paymentReference}">
          <button type="submit" class="btn-pay">Pay ${amountFormatted} (Simulate)</button>
        </form>
      `
      }
    </div>
    <div class="footer">
      🔒 Secured by Paystack (Mock Simulation)
    </div>
  </div>
</body>
</html>
  `;
}
