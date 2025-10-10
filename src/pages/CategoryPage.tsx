import { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Pagination from '../components/Pagination';

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  label: string | null;
}

interface Category {
  id: number;
  name: string;
}

const ITEMS_PER_PAGE = 8; // Đổi lại 12 sản phẩm/trang thay vì 4

export default function CategoryPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [totalCount, setTotalCount] = useState(0);
  
  // Get current page from URL
  const currentPage = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    if (id) {
      loadCategory();
      loadProducts();
    }
  }, [id, currentPage]);

  const loadCategory = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from('categories')
      .select('id, name')
      .eq('id', Number(id))
      .single();

    if (error) {
      console.error('Error loading category:', error);
    } else {
      setCategory(data);
    }
  };

  const loadProducts = async () => {
    if (!id) return;

    const startTime = Date.now();
    setLoading(true);
    setDebugInfo('Đang tải sản phẩm...');

    try {
      // Get total count
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', Number(id));

      // Get paginated products
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image, label')
        .eq('category_id', Number(id))
        .order('id', { ascending: false })
        .range(from, to);

      const endTime = Date.now();
      const queryTime = endTime - startTime;

      if (error) {
        console.error('Error loading products:', error);
        setDebugInfo(`❌ Lỗi: ${error.message}`);
      } else {
        setProducts(data || []);
        setTotalCount(count || 0);
        setDebugInfo(`✅ Trang ${currentPage}: ${data?.length || 0}/${count || 0} sản phẩm (${queryTime}ms)`);
      }
    } catch (err) {
      setDebugInfo('❌ Lỗi kết nối');
    }

    setLoading(false);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const formatPrice = (priceStr: string) => {
    const price = Number(priceStr.replace(/[^\d]/g, '')) || 0;
    return price.toLocaleString('vi-VN') + 'đ';
  };

  if (loading && !category) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Đang tải danh mục...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm">
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-900">{category?.name || 'Danh mục'}</span>
      </nav>

      {/* Header with Pagination Info */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {category?.name || 'Danh mục sản phẩm'}
        </h1>
        <div className="flex items-center justify-between">
          <p className="text-gray-600">
            {loading ? 'Đang tải...' : 
              `Hiển thị ${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} trong ${totalCount} sản phẩm`
            }
          </p>
          <p className="text-sm text-gray-500">
            Trang {currentPage} / {totalPages}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{debugInfo}</p>
        </div>
      )}

      {/* Products Grid */}
      {!loading && (
        <>
          {products.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Chưa có sản phẩm
              </h3>
              <p className="text-gray-600 mb-4">
                Danh mục này hiện chưa có sản phẩm nào.
              </p>
              <Link 
                to="/products" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Xem tất cả sản phẩm
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-8">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative">
                      <Link to={`/product/${product.id}`}>
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/300x300?text=No+Image';
                          }}
                        />
                      </Link>
                      
                      {/* Label Badge */}
                      {product.label && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-medium">
                          {product.label}
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div className="mb-3">
                        <span className="text-lg font-bold text-orange-600">
                          {formatPrice(product.price)}
                        </span>
                      </div>

                      <Link 
                        to={`/product/${product.id}`}
                        className="w-full bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-800 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center transition-all duration-200"
                      >
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  className="mt-8"
                />
              )}
            </>
          )}
        </>
      )}

    </div>
  );
}
