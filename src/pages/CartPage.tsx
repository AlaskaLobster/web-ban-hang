import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Minus, Plus, Trash2 } from 'lucide-react';
// src/pages/CartPage.tsx
import { useCart } from '../contexts/CartContext'; // thêm dòng này

type Row = {
  id: number;
  quantity: number;
  variant: {
    id: number;
    size: string;
    stock: number;
    price_vnd: number | null;
    product: {
      id: number;
      name: string;
      price: string;        // chuỗi "299.000đ"
      oldPrice: string | null;
      image: string;
    } | null;
  } | null;
};

const parseVnd = (s?: string | null): number => {
  if (!s) return 0;
  // "1.299.000đ" -> 1299000
  return Number(s.replace(/[^\d]/g, '')) || 0;
};

const formatVnd = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
   .replace('₫', 'đ');

const CartPage: React.FC = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { refresh } = useCart();
// sau khi updateQty/removeRow thành công:
refresh();
  const load = async () => {
    setLoading(true);
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) {
      // chưa đăng nhập → chuyển qua auth, quay lại sau
      navigate('/auth?redirect=/cart');
      return;
    }

    // join: cart -> product_variants -> products
    const { data, error } = await supabase
      .from('cart')
      .select(`
        id, quantity,
        variant:product_variants (
          id, size, stock, price_vnd,
          product:products ( id, name, price, oldPrice, image )
        )
      `)
      .eq('user_id', user.id)
      .order('id', { ascending: false });

    if (error) {
      console.error('[CartPage] fetch error:', error.message);
      setRows([]);
    } else {
      setRows((data || []) as unknown as Row[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const subtotal = useMemo(() => {
    return rows.reduce((sum, r) => {
      const base = r.variant?.price_vnd ?? parseVnd(r.variant?.product?.price);
      return sum + base * (r.quantity || 0);
    }, 0);
  }, [rows]);

  const updateQty = async (rowId: number, next: number) => {
    if (next <= 0) return removeRow(rowId);
    const { error } = await supabase.from('cart').update({ quantity: next }).eq('id', rowId);
    if (error) return alert('Cập nhật số lượng thất bại: ' + error.message);
    setRows(prev => prev.map(r => (r.id === rowId ? { ...r, quantity: next } : r)));
  };

  const removeRow = async (rowId: number) => {
    const { error } = await supabase.from('cart').delete().eq('id', rowId);
    if (error) return alert('Xoá sản phẩm thất bại: ' + error.message);
    setRows(prev => prev.filter(r => r.id !== rowId));
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" /> Đang tải giỏ hàng...
        </div>
      </section>
    );
  }

  if (rows.length === 0) {
    return (
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-2xl md:text-3xl font-black mb-4">Giỏ hàng</h1>
        <p className="text-gray-600 mb-6">Giỏ hàng của bạn đang trống.</p>
        <Link to="/products" className="inline-block border px-5 py-2 rounded-lg hover:border-black">
          Mua sắm ngay
        </Link>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <h1 className="text-2xl md:text-3xl font-black mb-6">Giỏ hàng</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {rows.map((r) => {
            const p = r.variant?.product;
            const unit = r.variant?.price_vnd ?? parseVnd(p?.price);
            return (
              <div key={r.id} className="flex items-center gap-4 p-4 border rounded-xl">
                <Link to={p ? `/product/${p.id}` : '#'} className="shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-50">
                  {p?.image ? (
                    <img src={p.image} alt={p?.name || ''} className="w-full h-full object-cover" />
                  ) : null}
                </Link>

                <div className="flex-1">
                  <Link to={p ? `/product/${p.id}` : '#'} className="font-semibold hover:text-orange-500">
                    {p?.name || 'Sản phẩm'}
                  </Link>
                  <div className="text-sm text-gray-500 mt-1">Size: {r.variant?.size}</div>
                  <div className="text-sm text-gray-500">Còn: {r.variant?.stock ?? 0}</div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center border rounded-lg">
                      <button onClick={() => updateQty(r.id, r.quantity - 1)} className="px-3 py-2" type="button">
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 min-w-[40px] text-center">{r.quantity}</span>
                      <button onClick={() => updateQty(r.id, r.quantity + 1)} className="px-3 py-2" type="button">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button onClick={() => removeRow(r.id)} className="text-red-600 hover:text-red-700" type="button" title="Xoá">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold">{formatVnd(unit * r.quantity)}</div>
                  <div className="text-sm text-gray-500">đơn giá: {formatVnd(unit)}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="p-6 border rounded-2xl sticky top-24">
            <h2 className="font-bold mb-4">Tóm tắt đơn hàng</h2>
            <div className="flex justify-between mb-2">
              <span>Tạm tính</span>
              <span className="font-semibold">{formatVnd(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-4 text-gray-500 text-sm">
              <span>Phí vận chuyển</span>
              <span>Sẽ tính ở bước sau</span>
            </div>
            <div className="flex justify-between text-lg font-black mb-6">
              <span>Tổng</span>
              <span>{formatVnd(subtotal)}</span>
            </div>

            <button
              onClick={() => alert('Checkout sẽ làm ở bước kế tiếp 😉')}
              className="w-full bg-black hover:bg-orange-500 text-white py-3 rounded-lg font-bold"
            >
              Thanh toán
            </button>

            <Link to="/products" className="block text-center mt-4 text-orange-600 hover:underline">
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
