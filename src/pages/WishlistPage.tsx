import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { supabase } from '../supabaseClient';
import WishlistButton from '../components/WishlistButton';

interface WishlistProduct {
  product_id: number;
  created_at: string;
  products: {
    id: number;
    name: string;
    price: string;
    oldPrice: string | null;
    image: string;
    label: string | null;
  };
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUserAndLoadWishlist();
  }, []);

  const checkUserAndLoadWishlist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      loadWishlist();
    } else {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    const { data, error } = await supabase
      .from('favorites')
      .select(`
        product_id,
        created_at,
        products (
          id,
          name,
          price,
          oldPrice,
          image,
          label
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading wishlist:', error);
      return;
    }

    // Fix: Map data to correct structure
    const mappedData = (data || []).map(item => ({
      ...item,
      products: Array.isArray(item.products) ? item.products[0] : item.products
    })).filter(item => item.products); // Remove items with null products

    setWishlistItems(mappedData);
    setLoading(false);
  };

  const formatPrice = (priceStr: string) => {
    const price = Number(priceStr.replace(/[^\d]/g, '')) || 0;
    return price.toLocaleString('vi-VN') + 'đ';
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Vui lòng đăng nhập</h2>
          <p className="text-gray-600 mb-4">Để xem danh sách yêu thích</p>
          <Link 
            to="/auth"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Sản phẩm yêu thích</h1>
      
      {wishlistItems.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Chưa có sản phẩm yêu thích</h2>
          <p className="text-gray-600 mb-4">Hãy thêm những sản phẩm bạn thích vào danh sách này</p>
          <Link 
            to="/products"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.product_id} className="bg-white rounded-lg shadow-sm border overflow-hidden group">
              <div className="relative">
                <Link to={`/product/${item.products.id}`}>
                  <img 
                    src={item.products.image} 
                    alt={item.products.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                </Link>
                
                {/* Wishlist Button */}
                <div className="absolute top-2 right-2">
                  <WishlistButton 
                    productId={item.products.id}
                    className="bg-white/80 backdrop-blur-sm"
                  />
                </div>

                {/* Label */}
                {item.products.label && (
                  <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                    {item.products.label}
                  </span>
                )}
              </div>

              <div className="p-4">
                <Link to={`/product/${item.products.id}`}>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-blue-600">
                    {item.products.name}
                  </h3>
                </Link>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-bold text-orange-600">
                    {formatPrice(item.products.price)}
                  </span>
                  {item.products.oldPrice && (
                    <span className="text-gray-400 line-through text-sm">
                      {item.products.oldPrice}
                    </span>
                  )}
                </div>

                <Link 
                  to={`/product/${item.products.id}`}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Xem chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
