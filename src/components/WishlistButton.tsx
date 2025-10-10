import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

interface WishlistButtonProps {
  productId: number;
  className?: string;
}

export default function WishlistButton({ productId, className = '' }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndWishlist();
  }, [productId]);

  const checkAuthAndWishlist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data } = await supabase
        .from('favorites')
        .select('product_id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();
      
      setIsWishlisted(!!data);
    }
  };

  const toggleWishlist = async (e: React.MouseEvent) => {
    console.log('Heart button clicked!'); // Debug log
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      console.log('No user, redirecting to auth'); // Debug log
      navigate('/auth');
      return;
    }

    console.log('Toggling wishlist for product:', productId); // Debug log
    setLoading(true);
    try {
      if (isWishlisted) {
        console.log('Removing from wishlist'); // Debug log
        // Remove from wishlist
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
        setIsWishlisted(false);
      } else {
        console.log('Adding to wishlist'); // Debug log
        // Add to wishlist
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            product_id: productId
          });

        if (error) throw error;
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Có lỗi xảy ra: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Debug render
  console.log('WishlistButton render:', { productId, isWishlisted, loading, user: !!user });

  return (
    <button
      onClick={toggleWishlist}
      disabled={loading}
      className={`p-2 rounded-full transition-all duration-200 border-2 border-red-300 ${
        isWishlisted 
          ? 'text-red-500 hover:text-red-600 bg-red-50' 
          : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'} ${className}`}
      title={isWishlisted ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
      style={{ zIndex: 10 }} // Ensure button is clickable
    >
      <Heart 
        className={`w-5 h-5 transition-all ${isWishlisted ? 'fill-current' : ''}`} 
      />
    </button>
  );
}
