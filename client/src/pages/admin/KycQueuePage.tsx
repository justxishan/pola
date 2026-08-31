import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { KycReviewPanel, KycDocumentRecord } from '@/components/organisms/KycReviewPanel';
import { EmptyState } from '@/components/molecules/EmptyState';
import { Spinner } from '@/components/atoms/Spinner';
import { AdminService } from '@/services/admin.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import {
  LayoutDashboard,
  ShieldCheck,
  CreditCard,
  ShoppingBag,
  AlertTriangle,
  Building,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const KycQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();

  const [queue, setQueue] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin/dashboard' },
    { id: 'kyc', label: 'KYC Verification', icon: <ShieldCheck className="w-5 h-5" />, path: '/admin/kyc' },
    { id: 'payouts', label: 'LankaPay Payouts', icon: <CreditCard className="w-5 h-5" />, path: '/admin/payouts' },
    { id: 'orders', label: 'Order Oversight', icon: <ShoppingBag className="w-5 h-5" />, path: '/admin/orders' },
    { id: 'disputes', label: 'Dispute Desk', icon: <AlertTriangle className="w-5 h-5" />, path: '/admin/disputes' },
    { id: 'hubs', label: 'Hubs & DCs', icon: <Building className="w-5 h-5" />, path: '/admin/hubs' },
  ];

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    try {
      setIsLoading(true);
      const res: any = await AdminService.getKycVerificationQueue();
      if (res.success && res.data) {
        setQueue(res.data.users || []);
        if (res.data.users && res.data.users.length > 0) {
          setSelectedRecord(res.data.users[0]);
        }
      }
    } catch (err: any) {
      toast.error('Failed to load KYC verification queue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      setIsProcessing(true);
      const res: any = await AdminService.approveKycUser(userId);
      if (res.success) {
        toast.success('User verified successfully!');
        fetchQueue();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve KYC');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (userId: string, reason: string) => {
    try {
      setIsProcessing(true);
      const res: any = await AdminService.rejectKycUser(userId, reason);
      if (res.success) {
        toast.success('User KYC rejected with reason.');
        fetchQueue();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject KYC');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DashboardLayout
      portalTitle="Pola Executive Command Center"
      portalRole={user?.role || 'Admin'}
      navItems={navItems}
      activePath="/admin/kyc"
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              KYC Verification Desk ({queue.length} Pending)
            </h1>
            <p className="text-xs text-slate-400">
              Inspect applicant NIC identification, face selfies, and LankaPay bank details
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : queue.length === 0 ? (
          <EmptyState
            title="KYC Verification Queue is Empty"
            description="All farmer and courier verification submissions have been reviewed."
          />
        ) : (
          <div className="space-y-6">
            {/* Horizontal Applicant Selector Strip */}
            {queue.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {queue.map((item) => {
                  const isSelected = selectedRecord?._id === item._id;
                  return (
                    <button
                      key={item._id}
                      onClick={() => setSelectedRecord(item)}
                      className={`p-3 rounded-2xl border text-left min-w-[200px] transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {item.fullName}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">{item.email}</p>
                      <span className="text-[10px] font-semibold text-emerald-600 capitalize mt-1 block">
                        {item.role?.replace(/_/g, ' ')}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Split Screen Inspector */}
            {selectedRecord && (
              <KycReviewPanel
                record={{
                  userId: selectedRecord._id,
                  fullName: selectedRecord.fullName,
                  email: selectedRecord.email,
                  phone: selectedRecord.phone || 'N/A',
                  role: selectedRecord.role,
                  nicNumber: selectedRecord.nicNumber,
                  bankDetails: selectedRecord.bankDetails,
                  kycDocuments: {
                    nicFrontUrl: selectedRecord.kycDocuments?.nicFrontUrl,
                    nicBackUrl: selectedRecord.kycDocuments?.nicBackUrl,
                    selfieUrl: selectedRecord.kycDocuments?.selfieUrl,
                    businessRegUrl: selectedRecord.kycDocuments?.businessRegUrl,
                  },
                  submittedAt: selectedRecord.updatedAt || selectedRecord.createdAt,
                }}
                onApprove={handleApprove}
                onReject={handleReject}
                isLoading={isProcessing}
              />
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
