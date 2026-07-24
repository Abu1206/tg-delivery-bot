import { Telegraf, Markup } from 'telegraf';
import config from './config.js';
import { parseFoodOrder } from './parser.js';
import { MOCK_VENDORS, getVendorById } from './vendors.js';
import { createOrder, setOrderVendor, getOrder, markOrderAsPaid } from './orders.js';
import { generatePaystackPaymentLink } from './paystack.js';

let botInstance = null;

export function initBot() {
  if (!config.BOT_TOKEN || config.BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
    console.warn('Telegraf bot initialized in standby mode (BOT_TOKEN missing).');
    return null;
  }

  const bot = new Telegraf(config.BOT_TOKEN);
  botInstance = bot;

  bot.command('start', (ctx) => {
    const welcomeMessage = `
<b>Welcome to Campus Food Delivery Bot</b>

You can order food from top campus vendors directly from Telegram.

<b>How to order:</b>
Send a message in the format:
<code>FOOD &lt;Item&gt; to &lt;Location&gt;</code>

<b>Example:</b>
<code>FOOD Rice to Hostel D</code>
<code>FOOD Jollof & Chicken to Hall 2 Room 10</code>
    `.trim();

    return ctx.replyWithHTML(welcomeMessage);
  });

  bot.command('help', (ctx) => {
    const helpMessage = `
<b>Order Instructions</b>

Simply type:
<code>FOOD &lt;Item&gt; to &lt;Location&gt;</code>

<b>Steps:</b>
1. Send your order request.
2. Choose your preferred vendor.
3. Pay securely via Paystack link (or simulate payment).
4. Receive instant order confirmation.
    `.trim();

    return ctx.replyWithHTML(helpMessage);
  });

  bot.on('text', (ctx) => {
    const text = ctx.message.text;

    if (text.startsWith('/')) return;

    const parsed = parseFoodOrder(text);

    if (!parsed.isValid) {
      return ctx.replyWithHTML(
        `<b>${parsed.error}</b>\n\n<b>Try:</b> <code>FOOD Rice to Hostel D</code>`
      );
    }

    const order = createOrder({
      chatId: ctx.chat.id,
      item: parsed.item,
      location: parsed.location,
    });

    const buttons = MOCK_VENDORS.map((vendor) => [
      Markup.button.callback(
        `${vendor.name} - NGN ${vendor.basePrice.toLocaleString()} (${vendor.eta})`,
        `vendor:${vendor.id}:${order.orderId}`
      ),
    ]);

    const messageText = `
<b>Order Received</b>

<b>Food Item:</b> ${order.item}
<b>Delivery Location:</b> ${order.location}

Please select a vendor to process your order:
    `.trim();

    return ctx.replyWithHTML(messageText, Markup.inlineKeyboard(buttons));
  });

  bot.action(/^vendor:(vendor-\d+):(ORD-\d+)$/, (ctx) => {
    const vendorId = ctx.match[1];
    const orderId = ctx.match[2];

    const vendor = getVendorById(vendorId);
    if (!vendor) {
      return ctx.answerCbQuery('Vendor not found.');
    }

    const order = setOrderVendor(orderId, vendor);
    if (!order) {
      return ctx.answerCbQuery('Order not found or expired.');
    }

    ctx.answerCbQuery(`Selected ${vendor.name}`);

    const paystackUrl = generatePaystackPaymentLink(order);

    const paymentText = `
<b>Paystack Checkout</b>

<b>Order ID:</b> <code>${order.orderId}</code>
<b>Item:</b> ${order.item}
<b>Vendor:</b> ${vendor.name}
<b>Location:</b> ${order.location}

<b>Item Price:</b> NGN ${vendor.basePrice.toLocaleString()}
<b>Delivery Fee:</b> NGN ${vendor.deliveryFee.toLocaleString()}
<b>Total Amount:</b> <b>NGN ${order.totalAmount.toLocaleString()}</b>

Click the button below to complete your payment via Paystack:
    `.trim();

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.url('Pay via Paystack', paystackUrl)],
      [Markup.button.callback('Simulate Successful Payment', `sim_pay:${order.orderId}`)],
    ]);

    return ctx.editMessageText(paymentText, {
      parse_mode: 'HTML',
      ...keyboard,
    });
  });

  bot.action(/^sim_pay:(ORD-\d+)$/, async (ctx) => {
    const orderId = ctx.match[1];
    const order = getOrder(orderId);

    if (!order) {
      return ctx.answerCbQuery('Order not found.');
    }

    if (order.status === 'PAID') {
      return ctx.answerCbQuery('Order is already paid.');
    }

    markOrderAsPaid(orderId);
    ctx.answerCbQuery('Payment simulated successfully.');

    await sendOrderConfirmationMessage(order);
  });

  return bot;
}

export async function sendOrderConfirmationMessage(order) {
  if (!botInstance) {
    console.warn(`[Bot Warning] Cannot send message for order ${order.orderId}: bot instance not running.`);
    return;
  }

  const vendorName = order.vendor ? order.vendor.name : 'Selected Vendor';
  const eta = order.vendor ? order.vendor.eta : '20-30 mins';

  const confirmationText = `
<b>Order Confirmed & Paid</b>

<b>Order ID:</b> <code>${order.orderId}</code>
<b>Status:</b> <i>Paid & Sent to Kitchen</i>

<b>Order Details:</b>
• <b>Item:</b> ${order.item}
• <b>Vendor:</b> ${vendorName}
• <b>Location:</b> ${order.location}
• <b>Total Paid:</b> NGN ${order.totalAmount.toLocaleString()}
• <b>Estimated Delivery:</b> ${eta}

Thank you for your order. Your food is on its way.
  `.trim();

  try {
    await botInstance.telegram.sendMessage(order.chatId, confirmationText, {
      parse_mode: 'HTML',
    });
  } catch (err) {
    console.error(`Failed to send confirmation message to chat ${order.chatId}:`, err.message);
  }
}

