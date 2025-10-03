import React from 'react';
import { Link } from 'react-router-dom'; // Import Link từ react-router-dom

const navItems = ['TRANG CHỦ', 'NỮ', 'NAM', 'PHỤ KIỆN', 'BỘ SƯU TẬP', 'SALE OFF'];

const NavBar: React.FC = () => {
  return (
    <nav className="hidden lg:flex items-center justify-between space-x-8 py-4 border-t border-gray-300 bg-white shadow-md rounded-xl px-6">
      {navItems.map((item, index) => (
        <Link
          key={index}
          to={`/${item.toLowerCase().replace(' ', '-')}`}  // Chuyển đổi tên thành đường dẫn đúng
          className="text-sm font-bold text-gray-800 hover:text-orange-500 transition-all duration-300 transform hover:scale-105 uppercase py-2 px-4 rounded-lg hover:bg-orange-50"
        >
          {item}
        </Link>
      ))}
    </nav>
  );
};

export default NavBar;
