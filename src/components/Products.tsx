import React, { useEffect, useState } from 'react';
import { Heart, Star } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { supabase } from '../supabaseClient';  // Sử dụng đường dẫn đúng
    

interface Product {
  id: number;
  name: string;
  price: string;
  oldPrice: string;
  image: string;
  label: string;
  rating: number;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);  // State to store fetched products
  const [loading, setLoading] = useState<boolean>(true);    // State to track loading status
  const [error, setError] = useState<string | null>(null);   // State for error handling

  // Fetch data from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')  // Thay 'products' bằng tên bảng của bạn trong Supabase
          .select('*');

        if (error) {
          throw error;
        }

        setProducts(data);  // Set fetched data into state
      } catch (error) {
        setError(error instanceof Error ? error.message : String(error));  // Set error message if the request fails
      } finally {
        setLoading(false);  // Set loading to false once data is fetched
      }
    };

    fetchProducts();
  }, []);  // Empty dependency array means this effect runs only once when the component mounts

  // Show loading state or error if any
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <section className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-black text-center mb-3 uppercase">
          Sản Phẩm <span className="text-orange-500">Nổi Bật</span>
        </h2>
        <p className="text-center text-gray-600 mb-12">Bộ sưu tập thể thao hot nhất hiện nay</p>

        <Swiper
          spaceBetween={20}
          slidesPerView={3}
          breakpoints={{
            1024: {
              slidesPerView: 3,
            },
            768: {
              slidesPerView: 2,
            },
            480: {
              slidesPerView: 1,
            },
          }}
          loop={true}
          autoplay={{
            delay: 3000,
          }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition group">
                <div className="relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
                  />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white ${product.label === 'HOT' ? 'bg-red-500' : product.label === 'NEW' ? 'bg-green-500' : 'bg-orange-500'}`}>
                    {product.label}
                  </span>
                  <button className="absolute top-3 right-3 bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-center mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-orange-500 font-black text-xl">{product.price}</span>
                    <span className="text-gray-400 text-sm line-through">{product.oldPrice}</span>
                  </div>
                  <button className="w-full bg-black hover:bg-orange-500 text-white py-2.5 rounded-lg transition font-bold uppercase text-sm">
                    Thêm Vào Giỏ
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default Products;
