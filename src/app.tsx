import { Routes, Route } from 'react-router-dom';
import RootLayout from './Layout/RootLayout';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import Auth from './pages/Auth';
import CartPage from './pages/CartPage';
import UserAccountPage from './pages/UserAccountPage'
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />
        <Route path="products" element={<CategoryPage />} />
        <Route path="product/:id" element={<ProductDetail />} />
        <Route path="auth" element={<Auth />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="*" element={<Home />} />
      <Route path="/user-account" element={<UserAccountPage />} />
       
      </Route>
    </Routes>
  );
}
