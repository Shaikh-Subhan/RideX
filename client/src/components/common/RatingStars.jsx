import React from 'react';
import { Star } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const RatingStars = ({
  rating = 0,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange = () => {},
  showNumber = false,
  totalReviews = null,
}) => {
  const { isDark } = useTheme();

  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  const starClass = sizeMap[size] || sizeMap.md;
  const numRating = Number(rating) || 0;

  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center">
        {[...Array(maxStars)].map((_, i) => {
          const starValue = i + 1;
          const isFilled = starValue <= numRating;
          const isHalf = !isFilled && starValue - 0.5 <= numRating;

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange(starValue)}
              className={`${
                interactive
                  ? 'cursor-pointer hover:scale-110 transition-transform p-0.5'
                  : 'cursor-default'
              }`}
              aria-label={`${starValue} star`}
            >
              <Star
                className={`${starClass} transition-colors ${
                  isFilled
                    ? isDark
                      ? 'fill-rx-accent text-rx-accent'
                      : 'fill-rx-accent text-rx-accent'
                    : isHalf
                    ? isDark
                      ? 'fill-rx-accent/50 text-rx-accent'
                      : 'fill-rx-accent/50 text-rx-accent'
                    : isDark
                    ? 'fill-rx-border text-rx-main'
                    : 'fill-rx-border text-rx-muted'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showNumber && (
        <span className={`text-xs font-bold ${isDark ? 'text-rx-main' : 'text-rx-main'}`}>
          {numRating > 0 ? numRating.toFixed(1) : 'New'}
        </span>
      )}

      {totalReviews !== null && totalReviews !== undefined && (
        <span className={`text-xs font-normal ${isDark ? 'text-rx-muted' : 'text-rx-main'}`}>
          ({totalReviews})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
