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
import { LayoutDashboard, Truck, Wallet, Radar } from 'lucide-react';
import toast from 'react-hot-toast';

export const AvailableTripsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();

  const [radiusKm, setRadiusKm] = useState(25);
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/delivery/dashboard' },
    { id: 'radar', label: 'Available Trips', icon: <Radar className="w-5 h-5" />, path: '/delivery/available' },
    { id: 'vehicles', label: 'My Vehicles', icon: <Truck className="w-5 h-5" />, path: '/delivery/vehicles' },
    { id: 'wallet', label: 'Earnings & Payouts', icon: <Wallet className="w-5 h-5" />, path: '/wallet' },
  ];

  useEffect(() => {
    fetchRadarTrips();
  }, [radiusKm]);

  const fetchRadarTrips = async () => {
    try {
      setIsLoading(true);
      const res: any = await DeliveryService.getAvailableRadarTrips(7.8731, 80.6517, radiusKm);
      if (res.success && res.data) {
        setTrips(res.data.availableOrders || []);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptTrip = async (orderId: string) => {
    try {
      const res: any = await DeliveryService.acceptTrip(orderId);
      if (res.success) {
        toast.success('Trip accepted! Proceed to Distribution Center for pickup.');
        fetchRadarTrips();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to accept trip');
    }
  };

  return (
    <DashboardLayout
      portalTitle="Delivery Operations Hub"
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
              Orders requiring courier pickup from nearest DC to customer destinations
            </p>
          </div>

          <div className="w-full sm:w-64 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <RangeSlider
              label="Radar Radius"
              min={5}
              max={50}
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
            {trips.map((t) => (
              <DeliveryOpportunityCard
                key={t._id}
                orderId={t._id}
                orderNumber={t.orderNumber}
                pickupLocation={t.assignedDcId?.name || 'Dambulla Regional DC'}
                deliveryLocation={`${t.deliveryAddress?.city}, ${t.deliveryAddress?.district}`}
                distanceKm={18}
                payoutLkr={t.feeBreakdown?.deliveryFeeLeg2Lkr || 650}
                itemCount={t.items?.length || 1}
                onAccept={() => handleAcceptTrip(t._id)}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
