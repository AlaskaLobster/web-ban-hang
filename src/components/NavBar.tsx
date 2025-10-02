import React from 'react';

const navItems = ['TRANG CHỦ', 'NỮ', 'NAM', 'PHỤ KIỆN', 'BỘ SƯU TẬP', 'SALE OFF'];

const NavBar: React.FC = () => {
  return (
    <nav className="hidden lg:flex items-center justify-between space-x-8 py-4 border-t">
      {navItems.map((item, index) => (
        <a
          key={index}
          href="#"
          className="text-sm font-bold text-gray-800 hover:text-orange-500 transition uppercase"
        >
          {item}
        </a>
      ))}
    </nav>
  );
};

export default NavBar;
