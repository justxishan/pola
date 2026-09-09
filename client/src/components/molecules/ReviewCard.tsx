import React from 'react';
import { cn } from '@/lib/cn';
import { Avatar } from '@/components/atoms/Avatar';
import { Star, CheckCircle } from 'lucide-react';

export interface ReviewCardProps {
  userName: string;
  userAvatar?: string;
  rating: number;
  createdAt: string;
  comment?: string;
  tags?: string[];
  isVerifiedBuyer?: boolean;
  className?: string;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({
  userName,
  userAvatar,
  rating,
  createdAt,
  comment,
  tags,
  isVerifiedBuyer = true,
  className,
}) => {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className={cn(
        'p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2.5',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar src={userAvatar} name={userName} size="sm" />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                {userName}
              </span>
              {isVerifiedBuyer && (
                <span className="inline-flex items-center gap-0.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle className="w-3 h-3 inline" /> Verified
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">{formattedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-0.5 text-amber-400">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'w-3.5 h-3.5',
                i < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'
              )}
            />
          ))}
        </div>
      </div>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {comment && (
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{comment}</p>
      )}
    </div>
  );
};
