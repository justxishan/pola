export interface PlateValidationResult {
  isValid: boolean;
  normalizedPlate: string;
  provincePrefix?: string;
  plateNumber: string;
  format: 'modern' | 'vintage' | 'dash';
}

const PROVINCE_CODES = ['WP', 'CP', 'SP', 'NP', 'EP', 'NW', 'NC', 'UP', 'SG'];

export const validateSriLankanPlate = (plate: string): PlateValidationResult => {
  if (!plate || typeof plate !== 'string') {
    return { isValid: false, normalizedPlate: '', plateNumber: '', format: 'modern' };
  }

  const cleaned = plate.trim().toUpperCase().replace(/\s+/g, ' ');

  // Format 1: Province Code + Modern (e.g. "WP CAB-1234" or "WP AA-1234")
  const provModernRegex = /^(WP|CP|SP|NP|EP|NW|NC|UP|SG)\s+([A-Z]{2,3})[\s\-]?([0-9]{4})$/;
  // Format 2: Standard Modern without province (e.g. "CAB-1234" or "AB-1234")
  const modernRegex = /^([A-Z]{2,3})[\s\-]?([0-9]{4})$/;
  // Format 3: Vintage Sri Lanka number (e.g. "19-1234" or "65 Sri 1234" or "300-1234")
  const vintageRegex = /^([0-9]{1,3})[\s\-]?(SRI\s+)?([0-9]{4})$/;

  if (provModernRegex.test(cleaned)) {
    const match = cleaned.match(provModernRegex)!;
    const provincePrefix = match[1];
    const letters = match[2];
    const digits = match[3];
    const normalized = `${provincePrefix} ${letters}-${digits}`;

    return {
      isValid: true,
      normalizedPlate: normalized,
      provincePrefix,
      plateNumber: `${letters}-${digits}`,
      format: 'modern',
    };
  }

  if (modernRegex.test(cleaned)) {
    const match = cleaned.match(modernRegex)!;
    const letters = match[1];
    const digits = match[2];
    const normalized = `${letters}-${digits}`;

    return {
      isValid: true,
      normalizedPlate: normalized,
      plateNumber: normalized,
      format: 'modern',
    };
  }

  if (vintageRegex.test(cleaned)) {
    const match = cleaned.match(vintageRegex)!;
    const prefix = match[1];
    const digits = match[3];
    const normalized = `${prefix}-${digits}`;

    return {
      isValid: true,
      normalizedPlate: normalized,
      plateNumber: normalized,
      format: 'vintage',
    };
  }

  return {
    isValid: false,
    normalizedPlate: cleaned,
    plateNumber: cleaned,
    format: 'modern',
  };
};
