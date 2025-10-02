import React from 'react';
import { Star } from 'lucide-react';

const reviews = [
  { id: 1, name: 'Minh Anh', avatar: 'MA', rating: 5, comment: 'Chất lượng áo quá tốt, vải mát lạnh, thoáng khí. Mặc tập rất thoải mái!', product: 'Áo Tập Gym' },
  { id: 2, name: 'Tuấn Kiệt', avatar: 'TK', rating: 5, comment: 'Shop giao hàng nhanh, đóng gói cẩn thận. Sản phẩm đúng như mô tả. Sẽ ủng hộ tiếp!', product: 'Quần Short' },
  { id: 3, name: 'Thu Hà', avatar: 'TH', rating: 5, comment: 'Bộ đồ yoga mặc rất đẹp, form chuẩn. Giá cả hợp lý. Rất hài lòng!', product: 'Bộ Yoga' },
];

const Reviews: React.FC = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl md:text-4xl font-black text-center mb-3 uppercase">
        Khách Hàng <span className="text-orange-500">Nói Gì</span>
      </h2>
      <p className="text-center text-gray-600 mb-12">Hàng nghìn đánh giá 5 sao từ khách hàng</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                {review.avatar}
              </div>
              <div>
                <h4 className="font-bold">{review.name}</h4>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-3 italic">"{review.comment}"</p>
            <p className="text-sm text-gray-500">Sản phẩm: {review.product}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Reviews;
