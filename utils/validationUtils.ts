// Format field names for display
export const formatFieldName = (field: string): string => {
  return field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Phone number validation
export const isValidPhoneNumber = (phone: string): boolean => {
  return /^(\+\d{1,3}[- ]?)?\d{10,15}$/.test(phone.replace(/\s/g, ''));
};

// Validate field value based on field type
export const validateFieldValue = (field: string, value: string): string | null => {
  if (!value.trim()) {
    return `Please fill in all required fields (${formatFieldName(field)})`;
  }
  
  if (field.toLowerCase().includes('email') && !isValidEmail(value)) {
    return 'Please enter a valid email address';
  }
  
  if (field.toLowerCase().includes('phone') && !isValidPhoneNumber(value)) {
    return 'Please enter a valid phone number';
  }
  
  return null;
};
