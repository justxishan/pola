import { NicDetails } from '../types/kyc.types.js';

export const validateSriLankanNic = (nic: string): NicDetails => {
  if (!nic || typeof nic !== 'string') {
    return { nicNumber: '', isOldFormat: false, isValid: false };
  }

  const cleaned = nic.trim().toUpperCase();

  // Old Format: 9 numbers + V or X
  const oldRegex = /^([0-9]{9})([VX])$/;
  // New Format: 12 numbers
  const newRegex = /^[0-9]{12}$/;

  if (oldRegex.test(cleaned)) {
    const match = cleaned.match(oldRegex)!;
    const digits = match[1];
    const year = 1900 + parseInt(digits.substring(0, 2), 10);
    const dayOfYear = parseInt(digits.substring(2, 5), 10);

    const gender: 'male' | 'female' = dayOfYear > 500 ? 'female' : 'male';
    const actualDay = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;

    const isValidDay = actualDay >= 1 && actualDay <= 366;

    return {
      nicNumber: cleaned,
      isOldFormat: true,
      birthYear: year,
      gender,
      isValid: isValidDay,
    };
  }

  if (newRegex.test(cleaned)) {
    const year = parseInt(cleaned.substring(0, 4), 10);
    const dayOfYear = parseInt(cleaned.substring(4, 7), 10);

    const gender: 'male' | 'female' = dayOfYear > 500 ? 'female' : 'male';
    const actualDay = dayOfYear > 500 ? dayOfYear - 500 : dayOfYear;

    const isValidDay = actualDay >= 1 && actualDay <= 366;
    const isValidYear = year >= 1900 && year <= new Date().getFullYear();

    return {
      nicNumber: cleaned,
      isOldFormat: false,
      birthYear: year,
      gender,
      isValid: isValidDay && isValidYear,
    };
  }

  return {
    nicNumber: cleaned,
    isOldFormat: false,
    isValid: false,
  };
};
