export interface ProvinceDistrictMap {
  [province: string]: string[];
}

export const PROVINCES_DISTRICTS: ProvinceDistrictMap = {
  Western: ['Colombo', 'Gampaha', 'Kalutara'],
  Central: ['Kandy', 'Matale', 'Nuwara Eliya'],
  Southern: ['Galle', 'Matara', 'Hambantota'],
  Northern: ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
  Eastern: ['Trincomalee', 'Batticaloa', 'Ampara'],
  'North Western': ['Kurunegala', 'Puttalam'],
  'North Central': ['Anuradhapura', 'Polonnaruwa'],
  Uva: ['Badulla', 'Monaragala'],
  Sabaragamuwa: ['Ratnapura', 'Kegalle'],
};

export const PROVINCES = Object.keys(PROVINCES_DISTRICTS);

export const DISTRICTS = Object.values(PROVINCES_DISTRICTS).flat();

export const getProvinceForDistrict = (district: string): string | undefined => {
  for (const [province, districts] of Object.entries(PROVINCES_DISTRICTS)) {
    if (districts.includes(district)) {
      return province;
    }
  }
  return undefined;
};
