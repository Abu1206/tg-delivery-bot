import { v4 as uuidv4 } from 'uuid';

/**
 * In-Memory Orders Store
 * Maps orderId -> Order Object
 */
const ordersMap = new Map();

/**
 * Maps payment reference -> orderId
 */
const referenceMap = new Map();

/**
 * Creates a new pending order draft.
 * @param {object} param0
 * @param {number} param0.chatId
 * @param {string} param0.item
 * @param {string} param0.location
 * @returns {object}
 */
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
    status: 'PENDING_VENDOR_SELECTION', // PENDING_VENDOR_SELECTION | PENDING_PAYMENT | PAID | FAILED
    createdAt: new Date().toISOString(),
  };

  ordersMap.set(orderId, order);
  return order;
}

/**
 * Attaches selected vendor and calculates pricing for an order.
 * @param {string} orderId
 * @param {object} vendor
 * @returns {object|null}
 */
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

/**
 * Gets an order by ID.
 * @param {string} orderId
 * @returns {object|null}
 */
export function getOrder(orderId) {
  return ordersMap.get(orderId) || null;
}

/**
 * Gets an order by Payment Reference.
 * @param {string} reference
 * @returns {object|null}
 */
export function getOrderByReference(reference) {
  const orderId = referenceMap.get(reference);
  if (!orderId) return null;
  return getOrder(orderId);
}

/**
 * Marks order as paid.
 * @param {string} orderId
 * @returns {object|null}
 */
export function markOrderAsPaid(orderId) {
  const order = ordersMap.get(orderId);
  if (!order) return null;

  order.status = 'PAID';
  order.paidAt = new Date().toISOString();
  ordersMap.set(orderId, order);
  return order;
}
