import React from 'react';
import { Truck, Shield, Award, Phone } from 'lucide-react';

const benefits = [
  { icon: Truck, title: 'MIỄN PHÍ VẬN CHUYỂN', desc: 'Đơn hàng từ 500K' },
  { icon: Shield, title: 'ĐỔI TRẢ DỄ DÀNG', desc: 'Trong vòng 7 ngày' },
  { icon: Award, title: 'CHẤT LƯỢNG CAO', desc: '100% hàng chính hãng' },
  { icon: Phone, title: 'HỖ TRỢ 24/7', desc: 'Luôn sẵn sàng phục vụ' },
];

const Benefits: React.FC = () => {
  return (
    <section className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <benefit.icon className="w-12 h-12 text-orange-500 mb-3" />
              <h3 className="font-bold text-sm mb-1">{benefit.title}</h3>
              <p className="text-xs text-gray-600">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
