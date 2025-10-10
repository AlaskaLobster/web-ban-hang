// src/components/RelatedProducts.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

type Product = {
  id: number;
  name: string;
  price: string;
  oldPrice: string | null;
  image: string;
};

type Props = {
  categoryId: number;
  excludeId?: number; // <-- THÊM prop này
};

const RelatedProducts: React.FC<Props> = ({ categoryId, excludeId }) => {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const load = async () => {
      let query = supabase
        .from('products')
        .select('id,name,price,oldPrice,image')
        .eq('category_id', categoryId)
        .limit(12);

      // Nếu muốn filter ngay trên DB (tốt hơn)
      if (excludeId != null) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('[RelatedProducts]', error.message);
        setItems([]);
      } else {
        setItems((data || []) as Product[]);
      }
    };
    load();
  }, [categoryId, excludeId]);

  if (!items.length) return null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Sản phẩm liên quan</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((p) => (
          <Link key={p.id} to={`/product/${p.id}`} className="block border rounded-xl overflow-hidden hover:shadow-md transition">
            <div className="aspect-square bg-gray-50">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-3">
              <div className="font-semibold line-clamp-2">{p.name}</div>
              <div className="text-orange-600 font-bold mt-1">{p.price}</div>
              {p.oldPrice && <div className="text-gray-400 text-sm line-through">{p.oldPrice}</div>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
