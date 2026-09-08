import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { DeliveryOpportunityCard } from '@/components/molecules/DeliveryOpportunityCard';
import { RangeSlider } from '@/components/molecules/RangeSlider';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Spinner } from '@/components/atoms/Spinner';
import { DeliveryService } from '@/services/delivery.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { getDeliveryNavItems } from '@/lib/navItems';
import { Radar } from 'lucide-react';
import toast from 'react-hot-toast';

/** Haversine distance in km between two GPS coordinates */
function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const AvailableTripsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const [radiusKm, setRadiusKm] = useState(35);
  const [trips, setTrips] = useState<any[]>([]);
  const [driverLat, setDriverLat] = useState<number | undefined>(undefined);
  const [driverLng, setDriverLng] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const navItems = getDeliveryNavItems(t as any);

  // Get real GPS on mount, then fetch
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDriverLat(pos.coords.latitude);
        setDriverLng(pos.coords.longitude);
      },
      () => {
        // GPS unavailable — backend will use saved location
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  // Re-fetch whenever radius or GPS coords change
  useEffect(() => {
    fetchRadarTrips();
  }, [radiusKm, driverLat, driverLng]);

  const fetchRadarTrips = async () => {
    try {
      setIsLoading(true);
      const res: any = await DeliveryService.getAvailableRadarTrips(driverLat, driverLng, radiusKm);
      if (res.success && res.data) {
        setTrips(res.data.orders || res.data.availableOrders || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch radar trips:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptTrip = async (orderId: string) => {
    try {
      setAcceptingId(orderId);
      const res: any = await DeliveryService.acceptTrip(orderId);
      if (res.success) {
        toast.success('Trip accepted! Proceeding to active dispatch screen.');
        navigate('/delivery/active-trip');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept trip');
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <DashboardLayout
      portalTitle={t.deliveryFleet}
      portalRole={user?.role || 'Delivery Partner'}
      navItems={navItems}
      activePath="/delivery/available"
      onNavigate={(path) => navigate(path)}
      currentLanguage={language}
      onLanguageChange={setLanguage}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      user={user || undefined}
      onLogout={() => {
        logout();
        navigate('/');
      }}
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Radar className="w-6 h-6 text-sky-600 animate-pulse" />
              Delivery Radar Matches ({trips.length})
            </h1>
            <p className="text-xs text-slate-400">
              New orders awaiting courier dispatch from Distribution Hubs to customer doorsteps
            </p>
          </div>

          <div className="w-full sm:w-64 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <RangeSlider
              label="Radar Radius"
              min={5}
              max={60}
              step={5}
              unit="km"
              value={radiusKm}
              onChange={setRadiusKm}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : trips.length === 0 ? (
          <EmptyState
            title="No Pending Trips within Radius"
            description="There are currently no orders waiting for delivery in your selected radar range. Try expanding your radius."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((t) => {
              const pickup = t.assignedDcId?.name || 'Regional Distribution Hub';
              const deliveryLoc = `${t.deliveryAddress?.city || 'Colombo'}, ${t.deliveryAddress?.district || 'Western'}`;
              const payout = t.leg2DeliveryFee ?? t.totalDeliveryFee ?? 0;
              const itemCount = t.items?.length || 1;

              // Compute real distance if we have both sets of coords
              const destLat = t.deliveryAddress?.gps?.latitude;
              const destLng = t.deliveryAddress?.gps?.longitude;
              const distanceKm =
                driverLat !== undefined &&
                driverLng !== undefined &&
                destLat !== undefined &&
                destLng !== undefined
                  ? Math.round(haversineKm(driverLat, driverLng, destLat, destLng) * 10) / 10
                  : undefined;

              return (
                <DeliveryOpportunityCard
                  key={t._id}
                  orderId={t._id}
                  orderNumber={t.orderNumber}
                  pickupLocation={pickup}
                  deliveryLocation={deliveryLoc}
                  distanceKm={distanceKm}
                  payoutLkr={payout}
                  itemCount={itemCount}
                  onAccept={() => handleAcceptTrip(t._id)}
                  isLoading={acceptingId === t._id}
                />
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
