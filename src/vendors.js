export const MOCK_VENDORS = [
  {
    id: 'vendor-1',
    name: 'Mama Put Kitchen',
    rating: '4.8',
    basePrice: 2000,
    deliveryFee: 300,
    eta: '20-30 mins',
  },
  {
    id: 'vendor-2',
    name: 'Campus Grill & Buka',
    rating: '4.6',
    basePrice: 2500,
    deliveryFee: 400,
    eta: '15-25 mins',
  },
  {
    id: 'vendor-3',
    name: 'FastBite Express',
    rating: '4.9',
    basePrice: 3000,
    deliveryFee: 200,
    eta: '10-20 mins',
  },
];

export function getVendorById(vendorId) {
  return MOCK_VENDORS.find((v) => v.id === vendorId) || null;
}

