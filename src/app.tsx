import { Routes, Route } from 'react-router-dom';
import RootLayout from './Layout/RootLayout';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import Auth from './pages/Auth';
import CartPage from './pages/CartPage';
<<<<<<< HEAD
import UserAccountPage from './pages/UserAccountPage'
import FavoritesPage from './pages/Favorites';
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<CategoryPage />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="auth" element={<Auth />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="*" element={<Home />} />
      <Route path="/user-account" element={<UserAccountPage />} />
       
      </Route>
    </Routes>
=======
import UserAccountPage from './pages/UserAccountPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import ProductsDetail from './pages/ProductDetail';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="products" element={<ProductsDetail />} />
            <Route path="category/:id" element={<CategoryPage />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="auth" element={<Auth />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="user-account" element={<UserAccountPage />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </main>
    </div>
>>>>>>> 2677b87c5b897748881ca224473d1f4876f886a7
  );
}

export default App;



