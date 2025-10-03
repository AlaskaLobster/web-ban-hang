import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import ProductCard, { Product } from '../pages/ProductCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

type Props = {
  productId: number;
  categoryId?: number | null;
  limit?: number; // mặc định 12
};

const RelatedProducts: React.FC<Props> = ({ productId, categoryId, limit = 12 }) => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const load = async () => {
      setLoading(true);
      if (!categoryId) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .neq('id', productId)
        .order('id', { ascending: false })
        .limit(limit);

      if (ignore) return;

      if (error) {
        console.error('[RelatedProducts] error:', error.message);
        setItems([]);
      } else {
        const mapped = (data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          oldPrice: p.oldPrice ?? null,
          image: p.image,
          label: p.label ?? null,
          rating: p.rating ?? 0,
        })) as Product[];
        setItems(mapped);
      }
      setLoading(false);
    };

    load();
    return () => { ignore = true; };
  }, [productId, categoryId, limit]);

  if (loading) return null;
  if (items.length === 0) return null;

  // Nếu ít hơn số slide desktop, không loop nhưng vẫn kéo tự do
  const slidesDesktop = 4;
  const canLoop = items.length >= slidesDesktop;

  return (
    <section className="container mx-auto px-4 pb-16">
      <h2 className="text-2xl md:text-3xl font-black mb-6">Sản phẩm tương tự</h2>

      <Swiper
        modules={[Navigation, FreeMode]}
        navigation
        freeMode={{ enabled: true }}
        grabCursor
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
        loop={canLoop}
        preventClicks
        preventClicksPropagation
      >
        {items.map((p) => (
          <SwiperSlide key={p.id}>
            <ProductCard product={p} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default RelatedProducts;
