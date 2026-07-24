import { v4 as uuidv4 } from 'uuid';

const ordersMap = new Map();
const referenceMap = new Map();

export function createOrder({ chatId, item, location }) {
  const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  const order = {
    orderId,
    chatId,
    item,
    location,
    vendor: null,
    totalAmount: 0,
    paymentReference: null,
    status: 'PENDING_VENDOR_SELECTION',
    createdAt: new Date().toISOString(),
  };

  ordersMap.set(orderId, order);
  return order;
}

export function setOrderVendor(orderId, vendor) {
  const order = ordersMap.get(orderId);
  if (!order) return null;

  order.vendor = vendor;
  order.totalAmount = vendor.basePrice + vendor.deliveryFee;
  order.status = 'PENDING_PAYMENT';
  order.paymentReference = `PAYSTACK-REF-${uuidv4().substring(0, 8).toUpperCase()}`;

  ordersMap.set(orderId, order);
  referenceMap.set(order.paymentReference, orderId);

  return order;
}

export function getOrder(orderId) {
  return ordersMap.get(orderId) || null;
}

export function getOrderByReference(reference) {
  const orderId = referenceMap.get(reference);
  if (!orderId) return null;
  return getOrder(orderId);
}

export function markOrderAsPaid(orderId) {
  const order = ordersMap.get(orderId);
  if (!order) return null;

  order.status = 'PAID';
  order.paidAt = new Date().toISOString();
  ordersMap.set(orderId, order);
  return order;
}

