import { useEffect, useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { partnerService } from '../../services/partner.service.js';

const Stars = ({ value }) => (
  <span style={{ display: 'inline-flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} size={14} color="#f59e0b" fill={n <= Math.round(value) ? '#f59e0b' : 'none'} />
    ))}
  </span>
);

const PartnerReviewsView = () => {
  const [rating, setRating] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([partnerService.getRating(), partnerService.getReviews()])
      .then(([r, rv]) => {
        if (!active) return;
        setRating(r?.data || null);
        setReviews(Array.isArray(rv?.data) ? rv.data : []);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="mui-card" style={{ padding: '26px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Loader2 size={18} className="spin" /> Loading reviews...
      </div>
    );
  }

  const total = rating?.totalRatings || 0;
  const bars = [
    [5, rating?.fiveStar], [4, rating?.fourStar], [3, rating?.threeStar], [2, rating?.twoStar], [1, rating?.oneStar],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="mui-card" style={{ padding: '24px', display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ textAlign: 'center', minWidth: '140px' }}>
          <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#0f172a' }}>
            {total ? Number(rating?.averageRating || 0).toFixed(1) : '--'}
          </div>
          <Stars value={rating?.averageRating || 0} />
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{total} rating{total === 1 ? '' : 's'}</div>
        </div>
        <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {bars.map(([star, count]) => {
            const pct = total ? Math.round(((count || 0) / total) * 100) : 0;
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem' }}>
                <span style={{ width: '28px', fontWeight: 700 }}>{star}★</span>
                <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b' }} />
                </div>
                <span style={{ width: '32px', textAlign: 'right', color: '#64748b' }}>{count || 0}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mui-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={20} color="#f59e0b" /> Customer Reviews
        </h3>
        {reviews.length === 0 ? (
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>No customer reviews yet. Complete bookings to start getting rated.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ padding: '14px 16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: '0.92rem' }}>{r.customer}</strong>
                  <Stars value={r.rating} />
                </div>
                {r.comment && <p style={{ margin: '6px 0 0', fontSize: '0.86rem', color: '#334155' }}>{r.comment}</p>}
                <div style={{ marginTop: '6px', fontSize: '0.74rem', color: '#94a3b8' }}>
                  {[r.service, r.bookingNumber, r.date ? new Date(r.date).toLocaleDateString() : ''].filter(Boolean).join(' • ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerReviewsView;
