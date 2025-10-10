import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

type Product = {
  id: number;
  name: string;
  price: string;
  image?: string | null;
};

const FavoritesPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const user = userRes?.user;
        if (!user) {
          if (mounted) setProducts([]);
          return;
        }

        // get favorite product ids
        const { data: favs, error: fErr } = await supabase
          .from('favorites')
          .select('product_id')
          .eq('user_id', user.id);
        if (fErr) throw fErr;
        const ids = (favs || []).map((r: any) => r.product_id);
        if (ids.length === 0) {
          if (mounted) setProducts([]);
          return;
        }

        const { data: prods, error: pErr } = await supabase
          .from('products')
          .select('id,name,price,image')
          .in('id', ids as any[]);
        if (pErr) throw pErr;
        if (mounted) setProducts((prods || []) as Product[]);
      } catch (e) {
        console.error('[Favorites] load error', e);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="container mx-auto px-4 py-10"><div className="flex items-center gap-2 text-gray-600"><Loader2 className="w-5 h-5 animate-spin"/> Đang tải...</div></div>;

  return (
    <section className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Sản phẩm yêu thích</h1>
      {products.length === 0 ? (
        <div className="text-gray-500">Bạn chưa có sản phẩm yêu thích nào.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <Link to={`/product/${p.id}`} key={p.id} className="block border rounded-lg overflow-hidden hover:shadow-lg">
              <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <div className="text-gray-400 p-6">No image</div>}
              </div>
              <div className="p-4">
                <div className="font-semibold mb-1">{p.name}</div>
                <div className="text-orange-500 font-black">{p.price}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default FavoritesPage;
