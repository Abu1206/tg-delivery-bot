export function parseFoodOrder(text) {
  if (!text || typeof text !== 'string') {
    return {
      isValid: false,
      error: 'Message content is empty.',
    };
  }

  const trimmedText = text.trim();
  const pattern = /^FOOD\s+(.+?)\s+to\s+(.+?)$/i;
  const match = trimmedText.match(pattern);

  if (!match) {
    return {
      isValid: false,
      error: 'Invalid order format. Use format: FOOD <Item> to <Location>\nExample: FOOD Rice to Hostel D',
    };
  }

  const item = match[1]?.trim();
  const location = match[2]?.trim();

  if (!item || !location) {
    return {
      isValid: false,
      error: 'Both food item and delivery location must be provided.',
    };
  }

  return {
    isValid: true,
    item,
    location,
  };
}

