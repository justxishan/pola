import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/templates/AuthLayout';
import { RoleSelectionCard } from '@/components/molecules/RoleSelectionCard';
import { Button } from '@/components/atoms/Button';
import { AuthService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { Role } from '@pola/shared';
import { Sprout, ShoppingCart, Truck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const RoleSelectPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role>(Role.FARMER);
  const [isLoading, setIsLoading] = useState(false);

  const { updateUser } = useAuthStore();

  const handleContinue = async () => {
    try {
      setIsLoading(true);
      const res: any = await AuthService.selectRole(selectedRole);

      if (res.success) {
        updateUser({ role: selectedRole });
        toast.success(`Role configured as ${selectedRole.replace(/_/g, ' ')}!`);

        // If farmer or delivery, take them to KYC upload, otherwise marketplace
        if (selectedRole === Role.FARMER || selectedRole === Role.DELIVERY_INDIVIDUAL) {
          navigate('/auth/kyc');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to assign role');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="How will you use Pola?"
      subtitle="Select your primary role to configure your personalized dashboard"
    >
      <div className="space-y-4">
        <RoleSelectionCard
          id="farmer"
          title="Farmer / Collector"
          titleSi="ගොවි / එකතුකරන්නා"
          description="List farm harvests, manage fields, track wholesale orders, and receive direct LankaPay bank payouts."
          icon={<Sprout className="w-7 h-7" />}
          isSelected={selectedRole === Role.FARMER}
          onSelect={() => setSelectedRole(Role.FARMER)}
          badgeText="Sell Produce"
        />

        <RoleSelectionCard
          id="customer"
          title="Household or Business Buyer"
          titleSi="පාරිභෝගිකයා / ආයතන"
          description="Browse direct farm vegetables, fruits, and grains with automated escrow protection and doorstep delivery."
          icon={<ShoppingCart className="w-7 h-7" />}
          isSelected={selectedRole === Role.CUSTOMER_B2C}
          onSelect={() => setSelectedRole(Role.CUSTOMER_B2C)}
          badgeText="Buy Direct"
        />

        <RoleSelectionCard
          id="delivery"
          title="Delivery Partner"
          titleSi="බෙදාහැරීමේ රියදුරු"
          description="Accept Leg-1 village collections or Leg-2 customer delivery trips within your preferred GPS radius."
          icon={<Truck className="w-7 h-7" />}
          isSelected={selectedRole === Role.DELIVERY_INDIVIDUAL}
          onSelect={() => setSelectedRole(Role.DELIVERY_INDIVIDUAL)}
          badgeText="Earn on Trips"
        />

        <Button
          variant="primary"
          size="lg"
          onClick={handleContinue}
          isLoading={isLoading}
          className="w-full mt-4"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Confirm & Continue
        </Button>
      </div>
    </AuthLayout>
  );
};
