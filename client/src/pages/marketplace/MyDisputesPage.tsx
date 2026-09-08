import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MarketplaceLayout } from '@/components/templates/MarketplaceLayout';
import { Badge } from '@/components/atoms/Badge';
import { Spinner } from '@/components/atoms/Spinner';
import { EmptyState } from '@/components/molecules/EmptyState';
import { DisputeService } from '@/services/dispute.service';
import { useAuthStore } from '@/store/authStore';
import { ShieldAlert, AlertCircle, CheckCircle2, Clock, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const MyDisputesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [disputes, setDisputes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDispute, setSelectedDispute] = useState<any | null>(null);

  useEffect(() => {
    fetchMyDisputes();
  }, []);

  const fetchMyDisputes = async () => {
    try {
      setIsLoading(true);
      const res: any = await DisputeService.getMyDisputes();
      if (res.success && res.data) {
        setDisputes(res.data.disputes || []);
      }
    } catch (err: any) {
      toast.error('Failed to load your disputes');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <Badge variant="emerald" size="sm"><CheckCircle2 className="w-3 h-3 mr-1" /> Resolved</Badge>;
      case 'rejected':
        return <Badge variant="rose" size="sm"><AlertCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'under_review':
        return <Badge variant="amber" size="sm"><Clock className="w-3 h-3 mr-1" /> Under Review</Badge>;
      default:
        return <Badge variant="slate" size="sm"><Clock className="w-3 h-3 mr-1" /> Open</Badge>;
    }
  };

  return (
    <MarketplaceLayout className="py-8 max-w-5xl mx-auto">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            My Disputes & Claims
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track resolution status and escrow claim decisions for your orders
          </p>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <Spinner size="lg" />
          </div>
        ) : disputes.length === 0 ? (
          <EmptyState
            icon={<ShieldAlert className="w-10 h-10 text-slate-400" />}
            title="No Active Disputes"
            description="You haven't filed any dispute claims. If you experience produce quality issues or non-delivery, you can open a dispute from your Order History."
            actionLabel="View My Orders"
            onAction={() => navigate('/orders')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {disputes.map((d) => (
              <div
                key={d._id}
                onClick={() => setSelectedDispute(d)}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-md hover:border-emerald-400 transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Order #{d.orderId?.orderNumber || (d.orderId?._id ? d.orderId._id.slice(-8) : d.orderId)}
                  </span>
                  {getStatusBadge(d.status)}
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm capitalize">
                    {d.reason?.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {d.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                  <span>Filed: {new Date(d.createdAt).toLocaleDateString()}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                    Details <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dispute Detail Modal */}
        {selectedDispute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    Dispute #{selectedDispute._id.slice(-8)}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 capitalize">
                    {selectedDispute.reason?.replace(/_/g, ' ')}
                  </h3>
                </div>
                {getStatusBadge(selectedDispute.status)}
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Description</span>
                  <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 mt-1">
                    {selectedDispute.description}
                  </p>
                </div>

                {selectedDispute.resolutionNotes && (
                  <div>
                    <span className="text-slate-400 block font-semibold">Admin Resolution</span>
                    <p className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 mt-1">
                      {selectedDispute.resolutionNotes}
                    </p>
                  </div>
                )}

                {selectedDispute.evidencePhotos?.length > 0 && (
                  <div>
                    <span className="text-slate-400 block font-semibold mb-1">Evidence Photos</span>
                    <div className="flex items-center gap-2 overflow-x-auto">
                      {selectedDispute.evidencePhotos.map((url: string, idx: number) => (
                        <img
                          key={idx}
                          src={url}
                          alt="Evidence"
                          className="w-16 h-16 object-cover rounded-xl border border-slate-200 dark:border-slate-700"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedDispute(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MarketplaceLayout>
  );
};
