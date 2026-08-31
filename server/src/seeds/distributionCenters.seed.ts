import { DistributionCenter } from '../models/DistributionCenter.model.js';
import { logger } from '../utils/logger.util.js';

export const seedDistributionCenters = async () => {
  const dcs = [
    {
      code: 'DC-DAMBULLA',
      name: 'Dambulla Central Distribution Centre (Main Hub)',
      roleDescription: 'National wholesale produce hub connecting Central, North Central and Eastern producing districts via A6/A9 highways.',
      isMainHub: true,
      province: 'Central',
      district: 'Matale',
      addressLine: 'Economic Centre Complex, Kurunegala Road',
      city: 'Dambulla',
      gps: { latitude: 7.8731, longitude: 80.6517 },
      contactPhone: '+94662284900',
      contactEmail: 'dc.dambulla@pola.lk',
      hasColdStorage: true,
      capacityMetricTons: 200,
      coverageRadiusKm: 60,
      operatingHours: '04:00 AM - 11:00 PM',
      isActive: true,
    },
    {
      code: 'DC-MEEGODA',
      name: 'Meegoda Western Distribution Centre',
      roleDescription: 'Western Province consuming-area hub serving supermarket chains, hotels, restaurants, and B2C households near E02/E01 expressways.',
      isMainHub: false,
      province: 'Western',
      district: 'Colombo',
      addressLine: 'High Level Road, Dedicated Economic Centre',
      city: 'Meegoda',
      gps: { latitude: 6.8522, longitude: 80.0528 },
      contactPhone: '+94112895400',
      contactEmail: 'dc.meegoda@pola.lk',
      hasColdStorage: true,
      capacityMetricTons: 150,
      coverageRadiusKm: 45,
      operatingHours: '05:00 AM - 10:00 PM',
      isActive: true,
    },
    {
      code: 'DC-MATARA',
      name: 'Matara Southern Distribution Centre',
      roleDescription: 'Southern tourism corridor hub serving Galle-Matara-Tangalle hotel belt and coastal buyers via E01 Southern Expressway.',
      isMainHub: false,
      province: 'Southern',
      district: 'Matara',
      addressLine: 'Nupe Junction, Galle Road',
      city: 'Matara',
      gps: { latitude: 5.9549, longitude: 80.555 },
      contactPhone: '+94412234500',
      contactEmail: 'dc.matara@pola.lk',
      hasColdStorage: true,
      capacityMetricTons: 80,
      coverageRadiusKm: 50,
      operatingHours: '05:00 AM - 09:00 PM',
      isActive: true,
    },
    {
      code: 'DC-ANURADHAPURA',
      name: 'Anuradhapura Northern Distribution Centre',
      roleDescription: 'Northern grain and paddy basket hub connecting North Central and Northern Province producers along the A9 highway.',
      isMainHub: false,
      province: 'North Central',
      district: 'Anuradhapura',
      addressLine: 'New Town Commercial Zone, Maithripala Senanayake Mawatha',
      city: 'Anuradhapura',
      gps: { latitude: 8.3114, longitude: 80.4037 },
      contactPhone: '+94252222100',
      contactEmail: 'dc.anuradhapura@pola.lk',
      hasColdStorage: false,
      capacityMetricTons: 100,
      coverageRadiusKm: 65,
      operatingHours: '05:00 AM - 08:00 PM',
      isActive: true,
    },
  ];

  for (const dc of dcs) {
    await DistributionCenter.findOneAndUpdate({ code: dc.code }, dc, {
      upsert: true,
      new: true,
    });
  }

  logger.info(`🏢 4 Regional Distribution Centers (Dambulla, Meegoda, Matara, Anuradhapura) seeded.`);
};
