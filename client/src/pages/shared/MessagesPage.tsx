import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Spinner } from '@/components/atoms/Spinner';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { ChatDrawer } from '@/components/organisms/ChatDrawer';
import { ChatService } from '@/services/chat.service';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { getFarmerNavItems, getDeliveryNavItems } from '@/lib/navItems';
import { ArrowLeft, MessageSquare, ChevronRight, Calendar, User, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme, language, setLanguage } = useThemeStore();
  const { t } = useTranslation();

  const isFarmer = user?.role?.startsWith('farmer') || user?.role === 'collector';
  const isDelivery = user?.role?.startsWith('delivery');

  const navItems = isFarmer
    ? getFarmerNavItems(t)
    : isDelivery
    ? getDeliveryNavItems(t)
    : [];

  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      const res: any = await ChatService.getMyConversations();
      if (res.success && res.data) {
        setConversations(res.data.conversations || []);
      }
    } catch (err) {
      console.error('Failed to load conversations', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChat = (conv: any) => {
    setSelectedOrder({
      _id: conv.orderId?._id || conv.orderId,
      orderNumber: conv.orderId?.orderNumber || 'Order Chat',
    });
    setIsChatOpen(true);
  };

  return (
    <DashboardLayout
      portalTitle={isFarmer ? (t.farmerOpsCenter || 'Farmer Portal') : 'Pola Portal'}
      portalRole={user?.role || 'User'}
      navItems={navItems}
      mobileNavItems={navItems.map((item) => ({
        id: item.id,
        label: item.label,
        icon: item.icon,
        path: item.path,
      }))}
      activePath=""
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
      <div className="max-w-3xl mx-auto space-y-6 text-left">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Messages & Order Communications
          </h1>
          <p className="text-xs text-slate-400">
            Direct chat threads with customers and dispatchers regarding specific order lots
          </p>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 w-fit mx-auto">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
              No Message Threads Yet
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              When customers or delivery drivers message you about active crop harvests or pickup details, conversations will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const orderNum = conv.orderId?.orderNumber || 'Order #' + conv._id.slice(-6);
              const lastMsg = conv.lastMessage?.text || 'Order conversation started';
              const lastTime = conv.lastMessage?.createdAt
                ? new Date(conv.lastMessage.createdAt).toLocaleDateString()
                : '';

              return (
                <div
                  key={conv._id}
                  onClick={() => handleOpenChat(conv)}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950 group-hover:text-emerald-600 transition-colors">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                          {orderNum}
                        </span>
                        {lastTime && (
                          <span className="text-[11px] text-slate-400">
                            • {lastTime}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {lastMsg}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Chat Drawer */}
        {selectedOrder && (
          <ChatDrawer
            isOpen={isChatOpen}
            onClose={() => {
              setIsChatOpen(false);
              fetchConversations();
            }}
            orderId={selectedOrder._id}
            orderNumber={selectedOrder.orderNumber}
          />
        )}
      </div>
    </DashboardLayout>
  );
};
