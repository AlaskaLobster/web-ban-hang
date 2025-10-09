import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useCart } from '../contexts/CartContext';
import { Loader2, ShoppingBag } from 'lucide-react';

interface CartItem {
  variant_id: number;
  product_id: number;
  quantity: number;
  product: {
    label: string;
    image: string;
  };
  variant: {
    size: string;
    price_vnd: number;
  };
}

interface CheckoutForm {
  full_name: string;
  phone: string;
  address: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { refresh } = useCart();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CheckoutForm>({
    full_name: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    loadUserData();
    loadCartItems();
  }, []);

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata) {
      setForm({
        full_name: user.user_metadata.full_name || '',
        phone: user.user_metadata.phone || '',
        address: user.user_metadata.address || ''
      });
    }
  };

  const loadCartItems = async () => {
    const { data, error } = await supabase
      .from('cart')
      .select(`
        variant_id,
        product_id,
        quantity,
        product:products(label, image),
        variant:product_variants(size, price_vnd)
      `);

    if (error) {
      console.error('Error loading cart:', error);
      return;
    }

    setCartItems((data || []).map(item => ({
      ...item,
      product: item.product[0],
      variant: item.variant[0]
    })));
  };

  const subtotal = cartItems.reduce((sum, item) => 
    sum + (item.quantity * item.variant.price_vnd), 0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone || !form.address) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      const { data: orderId, error } = await supabase.rpc('place_order', {
        p_full_name: form.full_name,
        p_phone: form.phone,
        p_address: form.address
      });

      if (error) throw error;

      refresh(); // Update cart badge
      navigate(`/orders/${orderId}/success`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Có lỗi xảy ra khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Giỏ hàng trống</h2>
          <button 
            onClick={() => navigate('/products')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Thanh toán</h1>
      
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Cart Summary */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Đơn hàng của bạn</h2>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={`${item.variant_id}`} className="flex items-center gap-4">
                <img 
                  src={item.product.image} 
                  alt={item.product.label}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.label}</h3>
                  <p className="text-sm text-gray-600">Size: {item.variant.size}</p>
                  <p className="text-sm">Số lượng: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {(item.quantity * item.variant.price_vnd).toLocaleString('vi-VN')}đ
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Tổng cộng:</span>
              <span>{subtotal.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Họ và tên *
              </label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Số điện thoại *
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Địa chỉ giao hàng *
              </label>
              <textarea
                value={form.address}
                onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Đang xử lý...' : 'Đặt hàng'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
