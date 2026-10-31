// Addresses are stored either as a plain string or as { addressLine, city, state, pincode, locationCoordinates }
export const formatAddress = (address) => {
  if (!address) return '';
  if (typeof address === 'string') return address.trim();
  if (typeof address !== 'object') return '';
  return [address.addressLine, address.city, address.state, address.pincode]
    .filter((part) => part !== undefined && part !== null && String(part).trim() !== '')
    .join(', ');
};
