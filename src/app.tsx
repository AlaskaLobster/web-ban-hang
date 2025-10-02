import { Routes, Route } from 'react-router-dom';
import RootLayout from './Layout/RootLayout';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
 import ProductDetail from './pages/ProductDetail'; 

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Home />} />                 {/* Trang chủ */}
        <Route path="products" element={<CategoryPage />} />{/* Danh mục */}
        { <Route path="product/:id" element={<ProductDetail />} />}
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
