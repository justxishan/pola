export interface BankInfo {
  code: string;
  name: string;
  shortName: string;
}

export const SRI_LANKAN_BANKS: BankInfo[] = [
  { code: '7010', name: 'Bank of Ceylon', shortName: 'BOC' },
  { code: '7083', name: 'People\'s Bank', shortName: 'People\'s' },
  { code: '7056', name: 'Commercial Bank of Ceylon', shortName: 'COMBANK' },
  { code: '7092', name: 'Hatton National Bank', shortName: 'HNB' },
  { code: '7162', name: 'Sampath Bank', shortName: 'Sampath' },
  { code: '7135', name: 'Nations Trust Bank', shortName: 'NTB' },
  { code: '7214', name: 'Seylan Bank', shortName: 'Seylan' },
  { code: '7074', name: 'National Development Bank', shortName: 'NDB' },
  { code: '7108', name: 'DFCC Bank', shortName: 'DFCC' },
  { code: '7205', name: 'Union Bank of Colombo', shortName: 'UBC' },
  { code: '7302', name: 'Pan Asia Banking Corporation', shortName: 'PABC' },
  { code: '7311', name: 'Amana Bank', shortName: 'Amana' },
  { code: '7384', name: 'Cargills Bank', shortName: 'Cargills' },
  { code: '7268', name: 'Regional Development Bank', shortName: 'RDB' },
  { code: '7277', name: 'Sanasa Development Bank', shortName: 'SDB' },
  { code: '7286', name: 'National Savings Bank', shortName: 'NSB' },
];

export const BANK_NAMES = SRI_LANKAN_BANKS.map((b) => b.name);
