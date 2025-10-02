import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Minus, Plus, Loader2, CheckCircle2 } from 'lucide-react';
import ProductCard, { Product } from '../pages/ProductCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

type DbProduct = {
  id: number;
  name: string;
  price: string;
  oldPrice: string | null;
  image: string;
  label: string | null;
  rating: number | null;
  category_id: number | null;
  description?: string | null;
};

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState<DbProduct | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [qty, setQty] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!id) return;
    let ignore = false;

    const load = async () => {
      setLoading(true);

      // 1) lấy sản phẩm theo id
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', Number(id))
        .maybeSingle();

      if (ignore) return;

      if (error || !data) {
        console.error('[ProductDetail] not found:', error?.message);
        setProduct(null);
        setLoading(false);
        return;
      }

      setProduct(data);

      // 2) sản phẩm liên quan cùng danh mục
      if (data.category_id) {
        const { data: rel } = await supabase
          .from('products')
          .select('*')
          .eq('category_id', data.category_id)
          .neq('id', data.id)
          .limit(12);

        const mapped = (rel || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          oldPrice: p.oldPrice ?? null,
          image: p.image,
          label: p.label ?? null,
          rating: p.rating ?? 0,
        })) as Product[];

        setRelated(mapped);
      } else {
        setRelated([]);
      }

      setLoading(false);
    };

    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  const addToCart = async () => {
    if (!product) return;

    // kiểm tra user đăng nhập
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      // Điều hướng sang trang đăng nhập nếu bạn đã có
      // navigate('/auth'); 
      return;
    }

    try {
      setAdding(true);
      // upsert: nếu đã có sẽ cập nhật quantity
      const { error } = await supabase
        .from('cart')
        .upsert(
          { user_id: user.id, product_id: product.id, quantity: qty },
          { onConflict: 'user_id,product_id' }
        );

      if (error) throw error;
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (e: any) {
      alert('Thêm vào giỏ thất bại: ' + e.message);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" /> Đang tải sản phẩm...
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">Không tìm thấy sản phẩm</h1>
        <Link to="/products" className="text-orange-500 hover:underline">← Quay lại danh sách</Link>
      </section>
    );
  }

  return (
    <>
      <section className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Hình */}
          <div className="rounded-2xl overflow-hidden shadow">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[420px] object-cover"
            />
          </div>

          {/* Thông tin */}
          <div>
            <h1 className="text-2xl md:text-3xl font-black mb-3">{product.name}</h1>

            {/* Giá */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-orange-500 font-black text-2xl">{product.price}</span>
              {product.oldPrice ? (
                <span className="text-gray-400 line-through">{product.oldPrice}</span>
              ) : null}
            </div>

            {/* Mô tả (nếu có) */}
            {product.description ? (
              <p className="text-gray-700 mb-6">{product.description}</p>
            ) : (
              <p className="text-gray-500 mb-6">
                Sản phẩm chính hãng, chất liệu thoáng mát, phù hợp tập luyện.
              </p>
            )}

            {/* Chọn số lượng */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-gray-600">Số lượng:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 min-w-[40px] text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="px-3 py-2"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Nút thêm giỏ */}
            <div className="flex items-center gap-3">
              <button
                onClick={addToCart}
                disabled={adding}
                className="bg-black hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-bold uppercase disabled:opacity-70"
              >
                {adding ? 'Đang thêm...' : 'Thêm vào giỏ'}
              </button>

              {added && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  Đã thêm vào giỏ!
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sản phẩm liên quan */}
      {related.length > 0 && (
        <section className="container mx-auto px-4 pb-16">
          <h2 className="text-2xl md:text-3xl font-black mb-6">Sản phẩm liên quan</h2>
          <Swiper modules={[Navigation]} navigation spaceBetween={16} slidesPerView={2}
            breakpoints={{ 640: {slidesPerView:3}, 1024: {slidesPerView:4} }}>
            {related.map((p) => (
              <SwiperSlide key={p.id}>
                <ProductCard product={p} />
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}
    </>
  );
};

export default ProductDetail;
