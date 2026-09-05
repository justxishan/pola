import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/templates/DashboardLayout';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useTranslation } from '@/lib/i18n';
import { getFarmerNavItems, getDeliveryNavItems } from '@/lib/navItems';
import { TicketService } from '@/services/ticket.service';
import {
  ArrowLeft,
  PhoneCall,
  MessageCircle,
  HelpCircle,
  Send,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const HelpSupportPage: React.FC = () => {
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

  const [category, setCategory] = useState('hub_grading');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter a description of your issue');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await TicketService.createTicket({
        subject: `Support Request — ${category}`,
        category,
        messageText: message.trim(),
        relatedOrderId: orderNumber.trim() || undefined,
      });
      const refId = result.data.ticket.ticketNumber;
      toast.success(`Support ticket ${refId} created. An agent will contact you shortly.`);
      setMessage('');
      setOrderNumber('');
    } catch (err) {
      toast.error('Failed to submit ticket. Please call hotline directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    {
      q: 'When are Village Hub intake sessions open?',
      a: 'Intake centers operate typically on Tuesdays and Fridays from 06:00 AM to 09:30 AM to catch the refrigerated transport trucks to Dambulla DC.',
    },
    {
      q: 'How does the Hub Quality Grading system work?',
      a: 'Inspectors grade crops into Grade A (100% payout), Grade B (90% payout), and Grade C (80% salvage/processing). If produce does not meet specifications, you may contest or take it back.',
    },
    {
      q: 'When do I receive payment in my LankaPay bank account?',
      a: 'Payments are held securely in Escrow and released to your wallet upon confirmed hub/DC intake. Withdrawals via LankaPay CEFT are credited within 24 business hours.',
    },
    {
      q: 'How do I return reusable plastic crates?',
      a: 'Return empty crates during any morning hub collection intake to receive immediate deposit credit or replacement crates for upcoming harvests.',
    },
  ];

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
      <div className="max-w-4xl mx-auto space-y-8 text-left">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
            Help & Farmer Support Desk
          </h1>
          <p className="text-xs text-slate-400">
            Direct assistance, Agrarian officer dispatch, and rapid dispute resolution
          </p>
        </div>

        {/* Emergency Hotlines Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="tel:1920"
            className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-4 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="p-3 rounded-2xl bg-emerald-600 text-white group-hover:scale-105 transition-transform">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Government Agri Hotline
              </span>
              <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                1920
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Toll-free advisory from Dept. of Agriculture
              </p>
            </div>
          </a>

          <a
            href="tel:+94112868920"
            className="p-5 rounded-3xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-start gap-4 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="p-3 rounded-2xl bg-sky-600 text-white group-hover:scale-105 transition-transform">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                Pola Support Operations
              </span>
              <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                011 286 8920
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Logistics & Village Hub intake issues
              </p>
            </div>
          </a>

          <a
            href="https://wa.me/94771234567"
            target="_blank"
            rel="noopener noreferrer"
            className="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-4 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="p-3 rounded-2xl bg-emerald-500 text-white group-hover:scale-105 transition-transform">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                WhatsApp Live Chat
              </span>
              <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                +94 77 123 4567
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Immediate photographic grading disputes
              </p>
            </div>
          </a>
        </div>

        {/* Submit Support Ticket */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
              Submit Support Ticket or Hub Inquiry
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Our regional field team typically responds within 2 hours during intake periods
            </p>
          </div>

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Issue Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="hub_grading">Hub Grading / Weight Discrepancy</option>
                <option value="payout_delay">LankaPay Settlement / Escrow Delay</option>
                <option value="transport_pickup">Transport Vehicle Missed Pickup</option>
                <option value="crates">Crate Deposit or Replacement</option>
                <option value="technical">Mobile App or Listing Issue</option>
              </Select>

              <Input
                label="Order Reference / Manifest Number (Optional)"
                placeholder="e.g. ORD-2026-9042 or MANIFEST-01"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Detailed Message
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain what happened, including hub location or lot weight..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Submit Ticket
              </Button>
            </div>
          </form>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            Frequently Asked Questions
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs cursor-pointer"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {faq.q}
                  </h4>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </div>
                {openFaq === idx && (
                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
