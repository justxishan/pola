import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button';
import { Textarea } from '@/components/atoms/Textarea';
import { Star, X, Check, Truck, Sprout } from 'lucide-react';
import { RatingService } from '@/services/rating.service';
import toast from 'react-hot-toast';

export interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  orderId?: string;
  farmerId?: string;
  farmerName?: string;
  driverId?: string;
  driverName?: string;
  productId?: string;
  productName?: string;
  onSubmitSuccess: () => void;
}

interface UniqueProduceItem {
  key: string;
  farmerId: string;
  farmerName: string;
  productId: string;
  productName: string;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  order,
  orderId: fallbackOrderId,
  farmerId: fallbackFarmerId,
  farmerName: fallbackFarmerName = 'Farmer Partner',
  driverId: fallbackDriverId,
  driverName: fallbackDriverName = 'Delivery Partner',
  productId: fallbackProductId,
  productName: fallbackProductName,
  onSubmitSuccess,
}) => {
  const effectiveOrderId = order?._id || fallbackOrderId || '';
  const orderNumber = order?.orderNumber || (effectiveOrderId ? `Order #${effectiveOrderId.slice(-8)}` : '');

  // Extract unique (farmerId, productId) pairs across order items
  const uniqueProduceItems = useMemo<UniqueProduceItem[]>(() => {
    if (!order?.items || !Array.isArray(order.items) || order.items.length === 0) {
      if (fallbackFarmerId || fallbackProductId) {
        return [
          {
            key: `${fallbackFarmerId || 'farmer'}_${fallbackProductId || 'prod'}`,
            farmerId: fallbackFarmerId || '',
            farmerName: fallbackFarmerName,
            productId: fallbackProductId || '',
            productName: fallbackProductName || 'Fresh Produce',
          },
        ];
      }
      return [];
    }

    const map = new Map<string, UniqueProduceItem>();
    for (const item of order.items) {
      const fId = (
        item.farmerId?._id ||
        item.farmerId ||
        order.farmerId?._id ||
        order.farmerId ||
        ''
      )?.toString();
      const pId = (item.productId?._id || item.productId || '')?.toString();
      const fName =
        item.farmerId?.fullName ||
        item.farmerName ||
        order.farmerId?.fullName ||
        'Farmer Partner';
      const pName =
        item.productName ||
        item.title ||
        item.productId?.productName ||
        item.productId?.title ||
        'Fresh Produce';

      const key = `${fId}_${pId}`;
      if (!map.has(key)) {
        map.set(key, {
          key,
          farmerId: fId,
          farmerName: fName,
          productId: pId,
          productName: pName,
        });
      }
    }

    return Array.from(map.values());
  }, [
    order,
    fallbackFarmerId,
    fallbackFarmerName,
    fallbackProductId,
    fallbackProductName,
  ]);

  // Track per-item produce ratings and comments
  const [produceRatings, setProduceRatings] = useState<
    Record<string, { rating: number; comment: string }>
  >({});

  // Reset ratings when modal opens with fresh items
  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, { rating: number; comment: string }> = {};
      for (const item of uniqueProduceItems) {
        initial[item.key] = { rating: 5, comment: '' };
      }
      setProduceRatings(initial);
      setDeliveryRating(5);
      setDeliveryComment('');
      setSelectedTags([]);
    }
  }, [isOpen, uniqueProduceItems]);

  const setItemRating = (key: string, rating: number) => {
    setProduceRatings((prev) => ({
      ...prev,
      [key]: {
        comment: prev[key]?.comment || '',
        rating,
      },
    }));
  };

  const setItemComment = (key: string, comment: string) => {
    setProduceRatings((prev) => ({
      ...prev,
      [key]: {
        rating: prev[key]?.rating || 5,
        comment,
      },
    }));
  };

  // Last-mile driver identification (leg2DriverId)
  const leg2Driver = order?.leg2DriverId;
  const leg2DriverUserId = (
    leg2Driver?._id ||
    leg2Driver ||
    fallbackDriverId ||
    ''
  )?.toString();
  const driverDisplayName =
    leg2Driver?.fullName || fallbackDriverName || 'Delivery Partner';
  const hasDeliveryLeg = Boolean(leg2DriverUserId || order?.leg2DriverId);

  const [deliveryRating, setDeliveryRating] = useState(5);
  const [deliveryComment, setDeliveryComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const availableTags = [
    'Super Fresh',
    'Crisp & Clean',
    'Accurate Weight',
    'Punctual Delivery',
    'Careful Handling',
    'Friendly Service',
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // 1. Submit rating for each unique produce item
      for (const item of uniqueProduceItems) {
        const itemState = produceRatings[item.key] || { rating: 5, comment: '' };
        await RatingService.submitRating({
          orderId: effectiveOrderId,
          targetType: 'farmer',
          targetUserId: item.farmerId || undefined,
          productId: item.productId || undefined,
          ratingScore: itemState.rating,
          reviewText: itemState.comment,
          tags: selectedTags,
        });
      }

      // 2. Submit delivery rating if driver is assigned
      if (leg2DriverUserId) {
        await RatingService.submitRating({
          orderId: effectiveOrderId,
          targetType: 'driver',
          targetUserId: leg2DriverUserId,
          ratingScore: deliveryRating,
          reviewText: deliveryComment,
          tags: selectedTags,
        });
      }

      toast.success('Thank you for your feedback! Ratings submitted.');
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
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1 text-left">
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
            Rate Your Produce & Delivery
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            {orderNumber || `Order #${effectiveOrderId.slice(-8)}`}
          </p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-6 text-sm text-left">
          {/* Produce Quality Ratings (1 block per unique produce item) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Sprout className="w-4 h-4 text-emerald-500" />
              <span>Produce Harvest Quality</span>
            </div>

            <div className="space-y-3">
              {uniqueProduceItems.map((item) => {
                const itemState = produceRatings[item.key] || { rating: 5, comment: '' };

                return (
                  <div
                    key={item.key}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {item.productName}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Cultivated by {item.farmerName}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 text-amber-400 self-start sm:self-auto">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setItemRating(item.key, i + 1)}
                            className="p-0.5 cursor-pointer hover:scale-110 transition-transform"
                          >
                            <Star
                              className={cn(
                                'w-5 h-5',
                                i < itemState.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-300 dark:text-slate-600'
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <Textarea
                      placeholder={`Tell us about the freshness and quality of ${item.productName}...`}
                      value={itemState.comment}
                      onChange={(e) => setItemComment(item.key, e.target.value)}
                      rows={2}
                      className="text-xs"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Driver Rating */}
          {hasDeliveryLeg && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <Truck className="w-4 h-4 text-emerald-500" />
                <span>Last-Mile Delivery Service</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      Doorstep Courier Partner
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Fulfilled by {driverDisplayName}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 self-start sm:self-auto">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setDeliveryRating(i + 1)}
                        className="p-0.5 cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Star
                          className={cn(
                            'w-5 h-5',
                            i < deliveryRating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 dark:text-slate-600'
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <Textarea
                  placeholder={`Feedback for ${driverDisplayName} regarding delivery punctuality & handling...`}
                  value={deliveryComment}
                  onChange={(e) => setDeliveryComment(e.target.value)}
                  rows={2}
                  className="text-xs"
                />
              </div>
            </div>
          )}

          {/* Quick Tag Chips */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
              Highlight Feedback Tags
            </span>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      'px-3 py-1 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-1',
                      isSelected
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-500 font-bold dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" size="sm" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              isLoading={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Submit All Reviews
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
