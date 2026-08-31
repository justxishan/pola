import { VillageHub } from '../models/VillageHub.model.js';
import { DistributionCenter } from '../models/DistributionCenter.model.js';
import { logger } from '../utils/logger.util.js';

export const seedVillageHubs = async () => {
  const dambullaDc = await DistributionCenter.findOne({ code: 'DC-DAMBULLA' });
  const meegodaDc = await DistributionCenter.findOne({ code: 'DC-MEEGODA' });
  const mataraDc = await DistributionCenter.findOne({ code: 'DC-MATARA' });
  const anuradhapuraDc = await DistributionCenter.findOne({ code: 'DC-ANURADHAPURA' });

  if (!dambullaDc || !meegodaDc || !mataraDc || !anuradhapuraDc) {
    logger.warn('DCs not found, skipping Village Hub seeding');
    return;
  }

  const hubs = [
    {
      hubCode: 'HUB-GALAWELA-01',
      hubName: 'Galewela Central Agricultural Hub',
      linkedDcId: dambullaDc._id,
      province: 'Central',
      district: 'Matale',
      addressLine: 'Main Street, Galewela',
      city: 'Galewela',
      servingVillages: ['Bambawa', 'Silvatgama', 'Pahatwela', 'Moragolla'],
      gps: { latitude: 7.7554, longitude: 80.5694 },
      contactPhone: '+94662288111',
      capacityKg: 8000,
      collectionSchedules: [
        { dayOfWeek: 'Tuesday', startTime: '06:00 AM', endTime: '09:30 AM', isActive: true },
        { dayOfWeek: 'Friday', startTime: '06:00 AM', endTime: '09:30 AM', isActive: true },
      ],
      isActive: true,
    },
    {
      hubCode: 'HUB-NUWARAELIYA-01',
      hubName: 'Kandapola Highland Vegetable Hub',
      linkedDcId: dambullaDc._id,
      province: 'Central',
      district: 'Nuwara Eliya',
      addressLine: 'Hawa Eliya Road, Kandapola',
      city: 'Nuwara Eliya',
      servingVillages: ['Kandapola', 'Ragala', 'Moon Plains', 'Pattipola'],
      gps: { latitude: 6.9818, longitude: 80.8251 },
      contactPhone: '+94522223400',
      capacityKg: 12000,
      collectionSchedules: [
        { dayOfWeek: 'Monday', startTime: '05:30 AM', endTime: '09:00 AM', isActive: true },
        { dayOfWeek: 'Thursday', startTime: '05:30 AM', endTime: '09:00 AM', isActive: true },
      ],
      isActive: true,
    },
    {
      hubCode: 'HUB-DIVULAPITIYA-01',
      hubName: 'Divulapitiya Agro Collection Hub',
      linkedDcId: meegodaDc._id,
      province: 'Western',
      district: 'Gampaha',
      addressLine: 'Mirigama Road, Divulapitiya',
      city: 'Divulapitiya',
      servingVillages: ['Hunupola', 'Kehelella', 'Balabowa', 'Dungalpitiya'],
      gps: { latitude: 7.2195, longitude: 80.0152 },
      contactPhone: '+94312245600',
      capacityKg: 6000,
      collectionSchedules: [
        { dayOfWeek: 'Wednesday', startTime: '06:00 AM', endTime: '09:00 AM', isActive: true },
        { dayOfWeek: 'Saturday', startTime: '06:00 AM', endTime: '09:00 AM', isActive: true },
      ],
      isActive: true,
    },
    {
      hubCode: 'HUB-EMBILIPITIYA-01',
      hubName: 'Embilipitiya Banana & Fruit Hub',
      linkedDcId: mataraDc._id,
      province: 'Sabaragamuwa',
      district: 'Ratnapura',
      addressLine: 'Nonagama Road, Embilipitiya',
      city: 'Embilipitiya',
      servingVillages: ['Pallegama', 'Kuttigala', 'Padalangala', 'Chandrika Wewa'],
      gps: { latitude: 6.3385, longitude: 80.8524 },
      contactPhone: '+94472261200',
      capacityKg: 10000,
      collectionSchedules: [
        { dayOfWeek: 'Tuesday', startTime: '06:00 AM', endTime: '09:00 AM', isActive: true },
        { dayOfWeek: 'Friday', startTime: '06:00 AM', endTime: '09:00 AM', isActive: true },
      ],
      isActive: true,
    },
    {
      hubCode: 'HUB-THAMBUTTEGAMA-01',
      hubName: 'Thambuttegama Grain & Paddy Hub',
      linkedDcId: anuradhapuraDc._id,
      province: 'North Central',
      district: 'Anuradhapura',
      addressLine: 'Kurunegala Road, Thambuttegama',
      city: 'Thambuttegama',
      servingVillages: ['Eppawala', 'Katiyawa', 'Talawa', 'Rajangana'],
      gps: { latitude: 8.1472, longitude: 80.2974 },
      contactPhone: '+94252276300',
      capacityKg: 15000,
      collectionSchedules: [
        { dayOfWeek: 'Monday', startTime: '06:00 AM', endTime: '10:00 AM', isActive: true },
        { dayOfWeek: 'Thursday', startTime: '06:00 AM', endTime: '10:00 AM', isActive: true },
      ],
      isActive: true,
    },
  ];

  for (const hub of hubs) {
    await VillageHub.findOneAndUpdate({ hubCode: hub.hubCode }, hub, {
      upsert: true,
      new: true,
    });
  }

  logger.info(`🏡 Seeded 5 Village Hubs with recurring collection schedules.`);
};
