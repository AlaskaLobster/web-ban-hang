import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

interface Product {
  id: number;
  name: string;
  price: string;
  oldPrice: string | null;
  image: string;
  label: string | null;
  category_id: number | null;
}

interface Category {
  id: number;
  name: string;
}

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Debounce search để tránh query liên tục
  const [searchInput, setSearchInput] = useState('');
  
  // Get search term from URL
  const searchTerm = searchParams.get('q') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedLabel = searchParams.get('label') || '';

  // Sync search input with URL
  useEffect(() => {
    setSearchInput(searchTerm);
  }, [searchTerm]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchTerm) {
        const params = new URLSearchParams(searchParams);
        if (searchInput) {
          params.set('q', searchInput);
        } else {
          params.delete('q');
        }
        setSearchParams(params);
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [searchParams]); // Reload when URL params change

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('id, name')
      .order('name');

    setCategories(data || []);
  };

  const [debugInfo, setDebugInfo] = useState<string>('');

  // Category slug mapping - UPDATE với data thực tế
  const categoryMap: Record<string, number> = {
    'thoi-trang-nam': 1,
    'thoi-trang-nu': 2, 
    'giay-dep': 3,
    'phu-kien': 4
    // Add mapping theo slug thực tế từ database
  };

  const loadProducts = async () => {
    const startTime = Date.now();
    setLoading(true);
    setDebugInfo('Bắt đầu query...');
    
    try {
      let query = supabase
        .from('products')
        .select('id, name, price, oldPrice, image, label, category_id');

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      // Category filter with slug support
      if (selectedCategory) {
        const categoryId = categoryMap[selectedCategory] || Number(selectedCategory);
        if (!isNaN(categoryId)) {
          query = query.eq('category_id', categoryId);
          setDebugInfo(`Filtering by category: ${selectedCategory} (ID: ${categoryId})`);
        }
      }

      if (selectedLabel) {
        query = query.eq('label', selectedLabel);
      }

      query = query.order('id', { ascending: false }).limit(10);

      const { data, error } = await query;
      
      const endTime = Date.now();
      const queryTime = endTime - startTime;
      
      console.log(`Query: ${queryTime}ms`, data);
      setDebugInfo(`Query: ${queryTime}ms | Category: ${selectedCategory} | Records: ${data?.length || 0}`);

      if (error) {
        console.error('Error:', error);
        setDebugInfo(`❌ Error: ${error.message}`);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      setDebugInfo('❌ Network Error');
    }
    
    setLoading(false);
  };

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const formatPrice = (priceStr: string) => {
    const price = Number(priceStr.replace(/[^\d]/g, '')) || 0;
    return price.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Debug Info */}
      <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
        <strong>Debug:</strong> {debugInfo}
      </div>

      {/* Header with search result info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {searchTerm ? `Kết quả tìm kiếm: "${searchTerm}"` : 'Tất cả sản phẩm'}
        </h1>
        <p className="text-gray-600">
          Hiển thị {products.length} sản phẩm
          {products.length === 20 && ' (giới hạn 20 kết quả)'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters - SIMPLIFIED */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-semibold mb-4">Bộ lọc đơn giản</h3>

            <div className="space-y-4">
              {/* Quick Search Input */}
              <div>
                <label className="block text-sm font-medium mb-2">Tìm kiếm</label>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tên sản phẩm..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Label Filter Only */}
              <div>
                <label className="block text-sm font-medium mb-2">Nhãn</label>
                <select
                  value={selectedLabel}
                  onChange={(e) => updateFilter('label', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Tất cả</option>
                  <option value="Sale">Sale</option>
                  <option value="New">New</option>
                  <option value="Hot">Hot</option>
                </select>
              </div>

              {/* Test Button */}
              <button
                onClick={() => {
                  setSearchInput('');
                  clearAllFilters();
                }}
                className="w-full bg-red-100 hover:bg-red-200 text-red-800 py-2 px-4 rounded-lg"
              >
                Test Load All Products
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:w-3/4">
          {/* Loading Indicator with more info */}
          {loading && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-blue-700 font-medium">Đang tải dữ liệu...</span>
              </div>
              <p className="text-center text-blue-600 text-sm">{debugInfo}</p>
            </div>
          )}

          {/* Active filters display */}
          {(searchTerm || selectedCategory || selectedLabel) && (
            <div className="mb-4 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                  Tìm: "{searchTerm}"
                  <button onClick={() => updateFilter('q', '')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                  Danh mục: {categories.find(c => c.id.toString() === selectedCategory)?.name}
                  <button onClick={() => updateFilter('category', '')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedLabel && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                  Nhãn: {selectedLabel}
                  <button onClick={() => updateFilter('label', '')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Products Grid - Optimized Images */}
          {!loading && products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600 mb-4">
                {searchTerm ? `Không tìm thấy sản phẩm nào cho "${searchTerm}"` : 'Không có sản phẩm nào'}
              </p>
              {(searchTerm || selectedCategory || selectedLabel) && (
                <button
                  onClick={clearAllFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Xem tất cả sản phẩm
                </button>
              )}
            </div>
          ) : (
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {products.map((product) => (
    <div key={product.id} className="bg-white rounded-lg shadow-sm border overflow-hidden group">
      <div className="relative">
        <Link to={`/product/${product.id}`}>
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-image.jpg';
            }}
          />
        </Link>
        {product.label && (
          <span className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
            {product.label}
          </span>
        )}
      </div>
      
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm mb-2 line-clamp-2 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-orange-600">
            {formatPrice(product.price)}
          </span>
        </div>

        <Link 
          to={`/product/${product.id}`}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
        >
          Xem chi tiết
        </Link>
      </div>
    </div>
  ))}
</div>
          )}
        </div>
      </div>
    </div>
  );
}

