export interface PhoneValidationResult {
  isValid: boolean;
  formattedNumber: string; // E.164 format: +947XXXXXXXX
  localFormat: string; // 07XXXXXXXX
  operator?: string;
}

const OPERATOR_PREFIXES: Record<string, string> = {
  '70': 'Mobitel',
  '71': 'Mobitel',
  '72': 'Hutch / Etisalat',
  '74': 'Dialog',
  '75': 'Airtel',
  '76': 'Dialog',
  '77': 'Dialog',
  '78': 'Hutch',
};

export const validateSriLankanPhone = (phone: string): PhoneValidationResult => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, formattedNumber: '', localFormat: '' };
  }

  // Remove spaces, hyphens, parentheses
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');

  // Normalize +94 or 0094 or 94 or 0 to standard
  if (cleaned.startsWith('+94')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('0094')) {
    cleaned = cleaned.substring(4);
  } else if (cleaned.startsWith('94')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }

  // Now cleaned should be 9 digits starting with 7X e.g. 771234567
  const slMobileRegex = /^(7[0-8][0-9]{7})$/;

  if (!slMobileRegex.test(cleaned)) {
    return {
      isValid: false,
      formattedNumber: phone,
      localFormat: phone,
    };
  }

  const prefix = cleaned.substring(0, 2);
  const operator = OPERATOR_PREFIXES[prefix] || 'Sri Lanka Mobile';

  return {
    isValid: true,
    formattedNumber: `+94${cleaned}`,
    localFormat: `0${cleaned}`,
    operator,
  };
};
