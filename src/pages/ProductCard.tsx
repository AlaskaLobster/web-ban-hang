import React from 'react';
import { Heart, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export type Product = {
  id: number;
  name: string;
  price: string;
  oldPrice?: string | null;
  image: string;
  label?: 'HOT' | 'NEW' | 'SALE' | string | null;
  rating?: number | null;
};

type Props = { product: Product };

const ProductCard: React.FC<Props> = ({ product }) => {
  const rating = Math.min(5, Math.max(0, product.rating ?? 0));

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition group">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-64 object-cover group-hover:scale-110 transition duration-500"
          loading="lazy"
        />
        {product.label ? (
          <span
            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white ${
              product.label === 'HOT'
                ? 'bg-red-500'
                : product.label === 'NEW'
                ? 'bg-green-500'
                : 'bg-orange-500'
            }`}
          >
            {product.label}
          </span>
        ) : null}
        <button className="absolute top-3 right-3 bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition">
          <Heart className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 hover:text-orange-500">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-orange-500 font-black text-xl">{product.price}</span>
          {product.oldPrice ? (
            <span className="text-gray-400 text-sm line-through">{product.oldPrice}</span>
          ) : null}
        </div>

        {/* Add to cart sẽ gắn sau */}
        <button className="w-full bg-black hover:bg-orange-500 text-white py-2.5 rounded-lg transition font-bold uppercase text-sm">
          Thêm Vào Giỏ
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
