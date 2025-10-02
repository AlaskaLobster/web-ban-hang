import React from 'react';
import { Facebook, Instagram, Youtube, Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-black mb-4">
              YOLO <span className="text-orange-500">SPORT</span>
            </h3>
            <p className="text-gray-400 mb-4">
              Thương hiệu thời trang thể thao số 1 Việt Nam
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-orange-500 transition">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-orange-500 transition">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-orange-500 transition">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase">Hỗ Trợ Khách Hàng</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-orange-500 transition">Hướng dẫn mua hàng</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Chính sách đổi trả</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Điều khoản dịch vụ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase">Về YOLO SPORT</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-orange-500 transition">Giới thiệu</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Tin tức</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-orange-500 transition">Liên hệ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 uppercase">Liên Hệ</h4>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <span>497 Phan Văn Trị, P.5, Gò Vấp, TP.HCM</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>1900 xxxx</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span>support@yolosport.vn</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-gray-500">
          <p>&copy; 2025 HIDAY SPORT .</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
