import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RatingStarsInput = ({
  rating = 0,
  onRatingChange,
  readOnly = false,
  size = 28,
  starColor = '#f59e0b',
  emptyColor = '#cbd5e1',
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const activeValue = hoverRating || rating;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {[1, 2, 3, 4, 5].map((starVal) => {
        const isFilled = starVal <= activeValue;

        return (
          <button
            key={starVal}
            type="button"
            disabled={readOnly}
            onClick={() => onRatingChange && onRatingChange(starVal)}
            onMouseEnter={() => !readOnly && setHoverRating(starVal)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '2px',
              cursor: readOnly ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease',
              transform: !readOnly && hoverRating === starVal ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            <Star
              size={size}
              fill={isFilled ? starColor : 'transparent'}
              color={isFilled ? starColor : emptyColor}
              strokeWidth={isFilled ? 0 : 2}
            />
          </button>
        );
      })}
    </div>
  );
};

export default RatingStarsInput;
