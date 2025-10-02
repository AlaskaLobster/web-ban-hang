import React, { useState } from 'react';
import NavBar from './NavBar';  // Import NavBar component
import { ShoppingCart, Search, User, Heart, Menu, X } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
}

const Header: React.FC<HeaderProps> = ({ cartCount }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="text-3xl font-black">
            <span className="text-black">HIDAY</span>
            <span className="text-orange-500"> SPORT</span>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex flex-1 max-w-xl mx-8">
            <div className="w-full relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full border-2 border-gray-300 rounded-full px-6 py-2.5 pr-12 focus:border-orange-500 outline-none"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-orange-500 text-white p-2 rounded-full hover:bg-orange-600 transition">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden md:flex items-center gap-2 hover:text-orange-500 transition">
              <User className="w-6 h-6" />
              <span className="text-sm font-medium">Tài khoản</span>
            </button>
            <button className="hover:text-orange-500 transition">
              <Heart className="w-6 h-6" />
            </button>
            <button className="relative hover:text-orange-500 transition">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
            <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <NavBar />  {/* Include the NavBar here */}

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden py-4 space-y-3 border-t">
            {navItems.map((item, index) => (
              <a key={index} href="#" className="block py-2 font-bold hover:text-orange-500 transition uppercase">
                {item}
              </a>
            ))}
            <div className="pt-3">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full border-2 border-gray-300 rounded-full px-4 py-2"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
