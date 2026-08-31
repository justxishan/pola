import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button';
import { Textarea } from '@/components/atoms/Textarea';
import { Star, X, Check } from 'lucide-react';

export interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  farmerName?: string;
  driverName?: string;
  onSubmit: (data: {
    produceRating: number;
    produceComment: string;
    deliveryRating: number;
    deliveryComment: string;
    feedbackTags: string[];
  }) => void;
  isLoading?: boolean;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  orderNumber,
  farmerName = 'Farmer',
  driverName = 'Delivery Partner',
  onSubmit,
  isLoading = false,
}) => {
  const [produceRating, setProduceRating] = useState(5);
  const [produceComment, setProduceComment] = useState('');
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [deliveryComment, setDeliveryComment] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      produceRating,
      produceComment,
      deliveryRating,
      deliveryComment,
      feedbackTags: selectedTags,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Rate Your Produce & Delivery
          </h3>
          <p className="text-xs text-slate-400">Order #{orderNumber}</p>
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-5 text-sm">
          {/* Produce Rating */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                Produce Freshness & Quality ({farmerName})
              </span>
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setProduceRating(i + 1)}
                    className="p-0.5 cursor-pointer"
                  >
                    <Star
                      className={cn(
                        'w-5 h-5 transition-transform hover:scale-110',
                        i < produceRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Tell us about the vegetables/fruits received..."
              value={produceComment}
              onChange={(e) => setProduceComment(e.target.value)}
              rows={2}
            />
          </div>

          {/* Delivery Rating */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                Delivery Service & Courier Care ({driverName})
              </span>
              <div className="flex gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setDeliveryRating(i + 1)}
                    className="p-0.5 cursor-pointer"
                  >
                    <Star
                      className={cn(
                        'w-5 h-5 transition-transform hover:scale-110',
                        i < deliveryRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Feedback for the courier partner..."
              value={deliveryComment}
              onChange={(e) => setDeliveryComment(e.target.value)}
              rows={2}
            />
          </div>

          {/* Quick Tag Chips */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
              Highlight Tags
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
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 text-emerald-600" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
              Submit Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
