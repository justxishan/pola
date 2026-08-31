import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Sprout } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <EmptyState
        icon={<Sprout className="w-10 h-10 text-emerald-600" />}
        title="404 — Page Not Found"
        description="The agricultural parcel or screen you are looking for does not exist or has moved."
        actionText="Back to Marketplace Home"
        onAction={() => navigate('/')}
      />
    </div>
  );
};
