import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Minus, Plus, Loader2, CheckCircle2, Image as ImageIcon, Star } from 'lucide-react';
import RelatedProducts from '../components/RelatedProducts';
import { useCart } from '../contexts/CartContext';

type DbProduct = {
  id: number;
  name: string;
  price: string;             // chuỗi "299.000đ"
  oldPrice: string | null;
  image: string;             // ảnh fallback
  label: string | null;
  rating: number | null;
  category_id: number | null;
  description?: string | null;
};

type Variant = {
  id: number;
  size: string;
  stock: number;
  price_vnd: number | null;
};

type PImage = {
  id: number;
  image_url: string;
  alt: string | null;
  sort_order: number | null;
};

const parseVnd = (s?: string | null) => (s ? Number(s.replace(/[^\d]/g, '')) || 0 : 0);
const formatVnd = (n: number) =>
  n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }).replace('₫', 'đ');

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [images, setImages] = useState<PImage[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  const [qty, setQty] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [reviewAvg, setReviewAvg] = useState<number>(0);

  const { addLocal, refresh } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!id) return;
    let ignore = false;

    const load = async () => {
      setLoading(true);

      // 1) product
      const { data: p, error: pe } = await supabase
        .from('products')
        .select('*')
        .eq('id', Number(id))
        .maybeSingle();

      if (ignore) return;

      if (pe || !p) {
        console.error('[ProductDetail] not found:', pe?.message);
        setProduct(null);
        setLoading(false);
        return;
      }
      setProduct(p);

      // 2) images
      const { data: imgs } = await supabase
        .from('product_images')
        .select('id,image_url,alt,sort_order')
        .eq('product_id', p.id)
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

      setImages(imgs || []);
      setSelectedImage((imgs && imgs[0]?.image_url) || p.image || null);

      // 3) variants (size)
      const { data: vars } = await supabase
        .from('product_variants')
        .select('id,size,stock,price_vnd')
        .eq('product_id', p.id)
        .order('size', { ascending: true });

      setVariants(vars || []);
      setSelectedVariantId(null); // bắt buộc chọn mỗi khi đổi sản phẩm
      setQty(1);

      // 4) reviews tổng quan
      const { count, error: rcErr } = await supabase
        .from('product_reviews')
        .select('rating', { head: true, count: 'exact' })
        .eq('product_id', p.id);

      if (rcErr) {
        console.warn('[ProductDetail] review count error:', rcErr.message);
        setReviewCount(0);
        setReviewAvg(0);
      } else {
        setReviewCount(count || 0);
        const { data: rdata } = await supabase
          .from('product_reviews')
          .select('rating')
          .eq('product_id', p.id)
          .limit(100);
        const arr = (rdata || []).map((r: any) => Number(r.rating) || 0);
        const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        setReviewAvg(avg);
      }

      setLoading(false);
    };

    load();
    return () => {
      ignore = true;
    };
  }, [id]);

  const currentVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) || null,
    [variants, selectedVariantId]
  );

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    return currentVariant?.price_vnd ?? parseVnd(product.price);
  }, [product, currentVariant]);

  const canAddToCart = useMemo(() => {
    // Có variant => phải chọn + qty > 0
    if (variants.length > 0) return selectedVariantId !== null && qty > 0;
    return false; // chưa có size thì không cho mua
  }, [variants.length, selectedVariantId, qty]);

  const incQty = () => {
    const maxStock = currentVariant?.stock ?? 99;
    setQty((q) => Math.min(q + 1, maxStock));
  };
  const decQty = () => setQty((q) => Math.max(1, q - 1));

  const onSelectVariant = (vid: number) => {
    setSelectedVariantId(vid);
    setQty(1);
  };

  const addToCart = async () => {
    if (!product) return;
    if (!canAddToCart || !selectedVariantId) {
      alert('Vui lòng chọn size trước khi thêm vào giỏ.');
      return;
    }

    // Kiểm tra đăng nhập
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) {
      navigate(`/auth?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }

    try {
      setAdding(true);
      // tăng badge lạc quan
      addLocal(qty);

      // Gọi RPC add_to_cart
      const { error } = await supabase.rpc('add_to_cart', {
        p_variant_id: selectedVariantId,
        p_qty: qty,
      });

      if (error) {
        // rollback nếu lỗi
        addLocal(-qty);
        throw error;
      }

      await refresh(); // đồng bộ lại từ server
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (e: any) {
      alert('Thêm vào giỏ thất bại: ' + (e?.message || e));
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
        <Link to="/products" className="text-orange-500 hover:underline">
          ← Quay lại danh sách
        </Link>
      </section>
    );
  }

  const roundedAvg = Math.round(reviewAvg || 0);

  return (
    <>
      <section className="container mx-auto px-4 py-10">
        {/* Breadcrumb nhẹ */}
        <div className="text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:text-orange-500">Trang chủ</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-orange-500">Sản phẩm</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-10 h-10" />
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-5 gap-3">
              {[...(images || []), ...(product.image ? [{ id: -1, image_url: product.image, alt: null, sort_order: 999 }] as any : [])]
                .slice(0, 10)
                .map((img: any) => (
                  <button
                    key={`${img.id}-${img.image_url}`}
                    onClick={() => setSelectedImage(img.image_url)}
                    className={`aspect-square rounded-xl overflow-hidden border ${
                      selectedImage === img.image_url ? 'border-black' : 'border-gray-200'
                    }`}
                    title="Xem ảnh"
                    type="button"
                  >
                    <img src={img.image_url} alt={img.alt || product.name} className="w-full h-full object-cover" />
                  </button>
                ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="text-2xl md:text-3xl font-black mb-3">{product.name}</h1>

            {/* Rating + count */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < roundedAvg ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {reviewCount > 0 ? `${reviewCount} đánh giá` : 'Chưa có đánh giá'}
              </span>
            </div>

            {/* Giá */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-black text-orange-600">{formatVnd(unitPrice)}</span>
              {product.oldPrice ? (
                <span className="text-gray-400 line-through">{product.oldPrice}</span>
              ) : null}
              {product.label ? (
                <span className="px-2 py-1 rounded bg-black text-white text-xs font-bold">{product.label}</span>
              ) : null}
            </div>

            {/* Mô tả ngắn */}
            {product.description ? (
              <p className="text-gray-700 leading-relaxed mb-6">{product.description}</p>
            ) : null}

            {/* Size selector */}
            <div className="mb-6">
              <div className="mb-2 font-semibold">Chọn size</div>
              {variants.length === 0 ? (
                <div className="text-sm text-gray-600">
                  Sản phẩm đang cập nhật size. Vui lòng quay lại sau.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const disabled = v.stock <= 0;
                    const active = selectedVariantId === v.id;
                    return (
                      <button
                        key={v.id}
                        onClick={() => !disabled && onSelectVariant(v.id)}
                        disabled={disabled}
                        className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${
                          active
                            ? 'bg-black text-white border-black'
                            : disabled
                            ? 'bg-gray-100 text-gray-400 border-gray-200'
                            : 'bg-white hover:border-black border-gray-300'
                        }`}
                        type="button"
                        title={disabled ? 'Hết hàng' : `Còn ${v.stock} sp`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Qty */}
            <div className="mb-6">
              <div className="mb-2 font-semibold">Số lượng</div>
              <div className="inline-flex items-center border rounded-lg">
                <button onClick={decQty} className="px-3 py-2" type="button">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 min-w-[48px] text-center">{qty}</span>
                <button onClick={incQty} className="px-3 py-2" type="button">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {currentVariant ? (
                <div className="text-sm text-gray-500 mt-2">
                  Tồn kho: {currentVariant.stock} {currentVariant.stock <= 0 ? '(Hết hàng)' : ''}
                </div>
              ) : null}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-3">
              <button
                onClick={addToCart}
              disabled={
            !canAddToCart ||
             adding ||
            ((currentVariant?.stock ?? 0) <= 0)
                }

                className="inline-flex items-center justify-center gap-2 bg-black hover:bg-orange-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-bold"
                type="button"
              >
                {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : added ? <CheckCircle2 className="w-5 h-5" /> : null}
                {added ? 'Đã thêm vào giỏ' : 'Mua ngay'}
              </button>

              <Link
                to="/cart"
                className="px-6 py-3 border rounded-lg font-semibold hover:border-black"
              >
                Xem giỏ hàng
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sản phẩm liên quan */}
      {product.category_id ? (
        <section className="container mx-auto px-4 pb-16">
         <RelatedProducts categoryId={product.category_id} excludeId={product.id} />
        </section>
      ) : null}
    </>
  );
};

export default ProductDetail;
