import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button';
import { Textarea } from '@/components/atoms/Textarea';
import { Star, X, Check, HeartHandshake } from 'lucide-react';
import { RatingService } from '@/services/rating.service';
import toast from 'react-hot-toast';

export interface RateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onSubmitSuccess: () => void;
}

export const RateCustomerModal: React.FC<RateCustomerModalProps> = ({
  isOpen,
  onClose,
  order,
  onSubmitSuccess,
}) => {
  const [ratingScore, setRatingScore] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRatingScore(5);
      setReviewText('');
      setSelectedTags([]);
    }
  }, [isOpen, order]);

  if (!isOpen || !order) return null;

  const orderId = order._id;
  const orderNumber = order.orderNumber || (orderId ? `Order #${orderId.slice(-8)}` : 'Order');
  const customerObj = order.customerId;
  const customerName =
    customerObj?.username ? `@${customerObj.username}` : (customerObj?.fullName || order.deliveryAddress?.contactName || 'Valued Customer');
  const targetUserId = customerObj?._id || (typeof customerObj === 'string' ? customerObj : undefined);

  const availableTags = [
    'Smooth Handoff',
    'Prompt Communication',
    'Accurate Inspection',
    'Polite & Professional',
    'Quick Confirmation',
    'Fair & Reasonable',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      await RatingService.submitRating({
        orderId,
        targetType: 'customer',
        targetUserId,
        ratingScore,
        reviewText,
        tags: selectedTags,
      });

      toast.success('Thank you! Customer rating submitted.');
      onSubmitSuccess();
      onClose();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || 'Failed to submit rating. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <HeartHandshake className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-wider">Two-Way Market Feedback</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Rate Customer Experience
          </h3>
          <p className="text-xs text-slate-400">
            {orderNumber} • Buyer: <span className="font-bold text-slate-700 dark:text-slate-300">{customerName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          {/* Star Rating */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-3 text-center">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
              How was your experience dealing with this buyer?
            </span>
            <div className="flex justify-center items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingScore(star)}
                  className="p-1.5 focus:outline-none transition-transform hover:scale-125 cursor-pointer"
                >
                  <Star
                    className={cn(
                      'w-7 h-7 transition-colors',
                      star <= ratingScore
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 dark:text-slate-700'
                    )}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-black text-amber-600 dark:text-amber-400">
              {ratingScore === 5 ? '5.0 — Excellent Buyer' : `${ratingScore}.0 Stars`}
            </span>
          </div>

          {/* Evaluation Tags */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Evaluation Badges
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer',
                      isSelected
                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                    <span>{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Comments or Notes (Optional)
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="e.g. Prompt payment confirmation, responsive communication, and smooth handover inspection..."
              rows={3}
              className="text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              className="bg-emerald-600 hover:bg-emerald-500"
            >
              Submit Rating
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};