export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export class RadiusService {
  /**
   * Calculate distance between two GPS coordinates using the Haversine formula (in kilometers)
   */
  static calculateDistanceKm(point1: GeoPoint, point2: GeoPoint): number {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const R = 6371; // Earth's radius in kilometers
    const dLat = toRad(point2.latitude - point1.latitude);
    const dLon = toRad(point2.longitude - point1.longitude);

    const lat1 = toRad(point1.latitude);
    const lat2 = toRad(point2.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Filter coordinates within a given radius
   */
  static isWithinRadius(origin: GeoPoint, target: GeoPoint, radiusKm: number): boolean {
    const distance = this.calculateDistanceKm(origin, target);
    return distance <= radiusKm;
  }
}
