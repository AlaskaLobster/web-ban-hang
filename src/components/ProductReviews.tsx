import { useState, useEffect } from 'react';
import { Star, Send, User } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface Review {
  id: number;
  rating: number;
  content: string;
  created_at: string;
  user_id: string;
}

interface ProductReviewsProps {
  productId: number;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<any>(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    loadReviews();
    checkUser();
  }, [productId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      const { data } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .single();
      
      setHasReviewed(!!data);
    }
  };

  const loadReviews = async () => {
    // SIMPLIFIED QUERY - Không dùng view phức tạp
    const { data, error } = await supabase
      .from('product_reviews')
      .select('id, rating, content, created_at, user_id')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading reviews:', error);
      return;
    }

    setReviews(data || []);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newReview.content.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: user.id,
          rating: newReview.rating,
          content: newReview.content.trim()
        });

      if (error) throw error;

      setNewReview({ rating: 5, content: '' });
      setHasReviewed(true);
      loadReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange?.(star)}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  const getUserDisplayName = (review: Review) => {
    // Đơn giản - hiển thị ID cuối
    return `Khách hàng #${review.user_id.slice(-4)}`;
  };

  return (
    <div className="mt-8">
      <div className="border-t pt-8">
        <h3 className="text-xl font-semibold mb-6">Đánh giá sản phẩm</h3>
        
        {/* Average Rating */}
        {reviews.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
              <div>
                {renderStars(Math.round(averageRating))}
                <p className="text-sm text-gray-600 mt-1">
                  {reviews.length} đánh giá
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Review Form */}
        {user && !hasReviewed && (
          <form onSubmit={handleSubmitReview} className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h4 className="font-semibold mb-4">Viết đánh giá của bạn</h4>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Đánh giá:</label>
              {renderStars(newReview.rating, true, (rating) => 
                setNewReview(prev => ({ ...prev, rating }))
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Nội dung:</label>
              <textarea
                value={newReview.content}
                onChange={(e) => setNewReview(prev => ({ ...prev, content: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !newReview.content.trim()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang gửi...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Gửi đánh giá
                </>
              )}
            </button>
          </form>
        )}

        {user && hasReviewed && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">✅ Bạn đã đánh giá sản phẩm này rồi. Cảm ơn!</p>
          </div>
        )}

        {!user && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Vui lòng <a href="/auth" className="underline">đăng nhập</a> để viết đánh giá
            </p>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Chưa có đánh giá nào. Hãy là người đầu tiên!
            </p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{getUserDisplayName(review)}</h5>
                      <span className="text-sm text-gray-500">
                        {formatDate(review.created_at)}
                      </span>
                    </div>
                    {renderStars(review.rating)}
                    <p className="mt-2 text-gray-700">{review.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
