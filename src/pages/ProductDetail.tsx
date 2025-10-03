import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Minus, Plus, Loader2, CheckCircle2, Image as ImageIcon, Star } from 'lucide-react';
import RelatedProducts from '../components/RelatedProducts';
type DbProduct = {
  id: number;
  name: string;
  price: string;
  oldPrice: string | null;
  image: string;                // ảnh chính (fallback)
  label: string | null;
  rating: number | null;        // trường cũ nếu có
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

  // Tải dữ liệu sản phẩm + ảnh + variants + tổng quan review
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

      // 2) images (order)
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
      setSelectedVariantId(null); // bắt buộc chọn

      // 4) reviews tổng quan (đã duyệt)
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
        // tính trung bình nhanh (lấy 100 bản gần nhất để ước lượng)
        const { data: rdata } = await supabase
          .from('product_reviews')
          .select('rating')
          .eq('product_id', p.id)
          .limit(100);
        const arr = (rdata || []).map((r: any) => r.rating as number);
        const avg = arr.length ? arr.reduce((a: number, b: number) => a + b, 0) / arr.length : 0;
        setReviewAvg(avg);
      }

      setLoading(false);
    };

    load();
    return () => { ignore = true; };
  }, [id]);

  const canAddToCart = useMemo(() => {
    // Nếu có variants (size), bắt buộc chọn; nếu chưa có variants -> chưa cho mua (admin sẽ nhập sau)
    if (variants.length > 0) return selectedVariantId !== null && qty > 0;
    return false;
  }, [variants.length, selectedVariantId, qty]);

  const addToCart = async () => {
    if (!product) return;
    if (!canAddToCart) return;

    // User phải đăng nhập
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      return;
    }

    try {
      setAdding(true);
      // upsert theo (user_id, variant_id)
      const { error } = await supabase
        .from('cart')
        .upsert(
          {
            user_id: user.id,
            product_id: product.id,
            variant_id: selectedVariantId, // BẮT BUỘC
            quantity: qty,
          },
          { onConflict: 'user_id,variant_id' }
        );

      if (error) throw error;
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
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
          {/* GALLERY */}
          <div>
            <div className="rounded-2xl overflow-hidden shadow bg-gray-50 aspect-[4/3] flex items-center justify-center">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <ImageIcon className="w-10 h-10 mb-2" />
                  <span>Chưa có hình ảnh</span>
                </div>
              )}
            </div>

            {/* thumbnails (scroll ngang) */}
            <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
              {images.length > 0 ? (
                images.map((im) => (
                  <button
                    key={im.id}
                    onClick={() => setSelectedImage(im.image_url)}
                    className={`shrink-0 w-24 h-24 rounded-xl overflow-hidden border ${
                      selectedImage === im.image_url ? 'border-black' : 'border-gray-200'
                    }`}
                    title={im.alt || ''}
                    type="button"
                  >
                    <img src={im.image_url} alt={im.alt || ''} className="w-full h-full object-cover" />
                  </button>
                ))
              ) : (
                <button
                  className="shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-dashed border-gray-300 text-gray-400 flex items-center justify-center"
                  title="Chưa có ảnh phụ"
                  type="button"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* THÔNG TIN + SIZE + CART */}
          <div>
            <h1 className="text-2xl md:text-3xl font-black mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-orange-500 font-black text-2xl">{product.price}</span>
              {product.oldPrice ? (
                <span className="text-gray-400 line-through">{product.oldPrice}</span>
              ) : null}
            </div>

            {product.description ? (
              <p className="text-gray-700 mb-6">{product.description}</p>
            ) : (
              <p className="text-gray-500 mb-6">Sản phẩm chính hãng, chất liệu thoáng mát, phù hợp tập luyện.</p>
            )}

            {/* SIZE SELECTOR */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Chọn size</span>
                <button type="button" className="text-sm text-orange-600 hover:underline">
                  Hướng dẫn chọn size
                </button>
              </div>

              {variants.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Chưa có size – admin sẽ cập nhật sớm.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => {
                    const selected = selectedVariantId === v.id;
                    const out = v.stock <= 0;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        disabled={out}
                        onClick={() => setSelectedVariantId(v.id)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition ${
                          selected
                            ? 'bg-black text-white border-black'
                            : out
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                            : 'bg-white text-gray-800 border-gray-300 hover:border-black'
                        }`}
                        title={out ? 'Hết hàng' : `Còn ${v.stock}`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* QTY + ADD */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border rounded-lg">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2" type="button">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 min-w-[40px] text-center">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="px-3 py-2" type="button">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={addToCart}
                disabled={!canAddToCart || adding}
                className="bg-black hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-bold uppercase disabled:opacity-60"
                title={variants.length === 0 ? 'Chưa có size' : !selectedVariantId ? 'Chọn size trước' : ''}
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

            {/* REVIEW SUMMARY */}
            <div className="mt-6 border-t pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">
                  {reviewCount > 0 ? `${reviewCount} đánh giá • ${reviewAvg.toFixed(1)}/5` : 'Chưa có đánh giá'}
                </span>
              </div>
              <Link to="#" className="text-sm text-orange-600 hover:underline">Xem đánh giá</Link>
            </div>
          </div>
        </div>
      </section>
      <RelatedProducts
  productId={product.id}
  categoryId={product.category_id}
/>
    </>
    
  );
};

export default ProductDetail;
