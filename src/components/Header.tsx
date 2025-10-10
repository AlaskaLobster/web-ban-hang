import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, ShoppingCart, Heart, Menu, Search, X } from 'lucide-react';
import { supabase } from '../supabaseClient';
import NavBar from './NavBar';  // Import NavBar component
import { useWishlist } from '../contexts/WishlistContext';

interface HeaderProps {
  cartCount: number;
<<<<<<< HEAD
  user?: any | null;
}

const Header: React.FC<HeaderProps> = ({ cartCount, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);
=======
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  } | null;
  onAuthChange?: () => void;
}

export default function Header({ cartCount, user, onAuthChange }: HeaderProps) {
  const { wishlistCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    onAuthChange?.();
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return null;
    return user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  };
>>>>>>> 2677b87c5b897748881ca224473d1f4876f886a7

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="text-3xl font-black">
            <Link to="/" className="hover:text-orange-500">HIDAY SPORT</Link>
          </div>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl mx-8">
            <div className="w-full relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </form>

          {/* Icons */}
          <div className="flex items-center gap-4">
<<<<<<< HEAD
            <Link to="/favorites" className="hidden md:flex items-center gap-2 hover:text-orange-500 transition">
              <Heart className="w-6 h-6" />
            </Link>
            <Link to="/cart" className="relative hover:text-orange-500 transition">
              <ShoppingCart className="w-6 h-6" />
=======
            {/* Wishlist Icon */}
            {user && (
              <Link to="/wishlist" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Heart className="w-6 h-6 text-gray-600 hover:text-red-500" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ShoppingCart className="w-6 h-6 text-gray-600" />
>>>>>>> 2677b87c5b897748881ca224473d1f4876f886a7
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Tài khoản */}
            {user ? (
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">{getUserDisplayName()}</span>
                <div className="relative group">
                  <button className="text-sm text-gray-600 hover:text-gray-900">
                    ▼
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link 
                      to="/user-account" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Tài khoản của tôi
                    </Link>
                    <button 
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="flex items-center gap-2 text-gray-700 hover:text-gray-900">
                <User className="w-5 h-5" />
                <span className="text-sm">Đăng nhập</span>
              </Link>
            )}
            <button className="lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Navigation Bar */}
        <NavBar />  {/* Render NavBar here */}

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden py-4 space-y-3 border-t">
            <Link to="/" className="block py-2 font-bold hover:text-orange-500 transition uppercase">Trang chủ</Link>
            <Link to="/category/1" className="block py-2 font-bold hover:text-blue-600 transition uppercase">Áo nam</Link>
            <Link to="/category/2" className="block py-2 font-bold hover:text-blue-600 transition uppercase">Áo nữ</Link>
            <Link to="/category/3" className="block py-2 font-bold hover:text-blue-600 transition uppercase">Giày dép</Link>
            <Link to="/cart" className="block py-2 font-bold hover:text-orange-500 transition uppercase">Giỏ hàng</Link>
            <Link to="/auth" className="block py-2 font-bold hover:text-orange-500 transition uppercase">Đăng nhập</Link>
            <Link to="/favorites" className="block py-2 font-bold hover:text-orange-500 transition uppercase">Yêu thích</Link>
          </div>
        )}
      </div>
    </header>
  );
}
