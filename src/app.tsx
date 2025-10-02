import React, { useEffect, useMemo, useReducer, useState } from "react";

/**
 * E-COMMERCE LAYOUT DEMO (React + TypeScript)
 * 14 pages: Home, Product, Categories, Cart, Checkout, Auth, Orders,
 * Profile, Reviews, Support, Search, Discounts, Reports, Shipping.
 * - Hash-router tự viết (không phụ thuộc lib).
 * - Tailwind classes cho UI; mock data + state in-memory.
 */

// -----------------------------
// Types
// -----------------------------
export type Product = {
  id: string;
  name: string;
  price: number;
  brand: string;
  category: string;
  description: string;
  colors: string[];
  sizes?: string[];
  image: string;
  stock: number;
  rating: number;
};

export type CartItem = { product: Product; qty: number };

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  status: "processing" | "shipped" | "delivered" | "cancelled";
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  shippingAddress?: string;
};

// -----------------------------
// Mock Data
// -----------------------------
const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Áo Thun Thể Thao DryFit",
    price: 299000,
    brand: "Athletica",
    category: "Quần áo",
    description: "Chất liệu thấm hút nhanh, phù hợp chạy bộ và gym.",
    colors: ["black", "white", "blue"],
    sizes: ["S", "M", "L", "XL"],
    image:
      "https://images.unsplash.com/photo-1528701800489-20be0c2a9a3b?q=80&w=1200&auto=format&fit=crop",
    stock: 25,
    rating: 4.4,
  },
  {
    id: "p2",
    name: "Giày Chạy Bộ ProRun 5",
    price: 1599000,
    brand: "ProRun",
    category: "Giày",
    description: "Đế êm, hoàn hảo cho cự ly 5-10km, hỗ trợ cổ chân.",
    colors: ["gray", "red"],
    sizes: ["38", "39", "40", "41", "42", "43"],
    image:
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1200&auto=format&fit=crop",
    stock: 10,
    rating: 4.7,
  },
  {
    id: "p3",
    name: "Tạ Đơn 10kg (cặp)",
    price: 690000,
    brand: "IronFit",
    category: "Dụng cụ",
    description: "Bọc cao su giảm ồn, tay cầm chống trơn trượt.",
    colors: ["black"],
    image:
      "https://images.unsplash.com/photo-1583454110551-21f2fa2f3f17?q=80&w=1200&auto=format&fit=crop",
    stock: 40,
    rating: 4.5,
  },
];

const MOCK_ORDERS: Order[] = [
  {
    id: "o1001",
    items: [
      { product: MOCK_PRODUCTS[1], qty: 1 },
      { product: MOCK_PRODUCTS[0], qty: 2 },
    ],
    total: 299000 * 2 + 1599000,
    createdAt: "2025-09-15T10:20:00Z",
    status: "delivered",
  },
  {
    id: "o1002",
    items: [{ product: MOCK_PRODUCTS[2], qty: 1 }],
    total: 690000,
    createdAt: "2025-09-28T08:05:00Z",
    status: "processing",
  },
];

// -----------------------------
// Promo & Category Images
// -----------------------------
const PROMOS = [
  {
    id: "sale-running",
    title: "Giày chạy -20%",
    desc: "Ưu đãi riêng cho runner, số lượng có hạn.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
    cta: { label: "Lấy mã", to: "discounts" as const },
  },
  {
    id: "gym-bundle",
    title: "Combo Gym tiết kiệm",
    desc: "Tạ tay + găng tay + dây kháng lực.",
    image:
      "https://images.unsplash.com/photo-1571731956672-ac8e8ad186af?q=80&w=1200&auto=format&fit=crop",
    cta: { label: "Xem ưu đãi", to: "discounts" as const },
  },
  {
    id: "apparel",
    title: "Đồ tập mới về",
    desc: "DryFit, thoáng mát, nhiều size.",
    image:
      "https://images.unsplash.com/photo-1511556670410-f9ea7f2a8bff?q=80&w=1200&auto=format&fit=crop",
    cta: { label: "Mua ngay", to: "categories" as const },
  },
];

const CATEGORY_IMAGES: Record<string, string> = {
  "Quần áo":
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1200&auto=format&fit=crop",
  "Giày":
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
  "Dụng cụ":
    "https://images.unsplash.com/photo-1599050751790-2682b9a07f4e?q=80&w=1200&auto=format&fit=crop",
};

// -----------------------------
// Utilities
// -----------------------------
const currency = (v: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    v
  );

const classNames = (...s: (string | false | undefined)[]) =>
  s.filter(Boolean).join(" ");

// -----------------------------
// Global Store (Reducer)
// -----------------------------
type State = {
  user: User | null;
  cart: CartItem[];
  orders: Order[];
  coupons: {
    code: string;
    type: "percent" | "fixed";
    value: number;
    active: boolean;
  }[];
};

type Action =
  | { type: "LOGIN"; payload: User }
  | { type: "LOGOUT" }
  | { type: "ADD_TO_CART"; payload: { product: Product; qty?: number } }
  | { type: "REMOVE_FROM_CART"; payload: { productId: string } }
  | { type: "SET_QTY"; payload: { productId: string; qty: number } }
  | { type: "PLACE_ORDER"; payload: Order }
  | { type: "APPLY_COUPON"; payload: string };

const initialState: State = {
  user: {
    id: "u1",
    name: "Khách Demo",
    email: "demo@shop.vn",
    phone: "0900000000",
  },
  cart: [],
  orders: MOCK_ORDERS,
  coupons: [
    { code: "SPORT10", type: "percent", value: 10, active: true },
    { code: "FREESHIP", type: "fixed", value: 30000, active: true },
  ],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, user: null };
    case "ADD_TO_CART": {
      const qty = action.payload.qty ?? 1;
      const exists = state.cart.find(
        (c) => c.product.id === action.payload.product.id
      );
      const cart = exists
        ? state.cart.map((c) =>
            c.product.id === action.payload.product.id
              ? { ...c, qty: c.qty + qty }
              : c
          )
        : [...state.cart, { product: action.payload.product, qty }];
      return { ...state, cart };
    }
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter(
          (c) => c.product.id !== action.payload.productId
        ),
      };
    case "SET_QTY": {
      const cart = state.cart.map((c) =>
        c.product.id === action.payload.productId
          ? { ...c, qty: action.payload.qty }
          : c
      );
      return { ...state, cart };
    }
    case "PLACE_ORDER":
      return { ...state, cart: [], orders: [action.payload, ...state.orders] };
    case "APPLY_COUPON":
      return state;
    default:
      return state;
  }
}

// -----------------------------
// Mini Hash Router
// -----------------------------
type RouteKey =
  | "home"
  | "product"
  | "categories"
  | "cart"
  | "checkout"
  | "auth"
  | "orders"
  | "profile"
  | "reviews"
  | "support"
  | "search"
  | "discounts"
  | "reports"
  | "shipping";

const parseHash = (): { route: RouteKey; params: Record<string, string> } => {
  const raw = window.location.hash.replace(/^#\/?/, "");
  const [path, query] = raw.split("?");
  const route = (path || "home") as RouteKey;

  // ép kiểu rõ ràng để TS không phàn nàn về iterator
  const params = Object.fromEntries(
    Array.from(new URLSearchParams(query || ""))
  ) as Record<string, string>;

  return { route, params };
};

const useHashRoute = () => {
  const [state, setState] = useState(parseHash());
  useEffect(() => {
    const onHash = () => setState(parseHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return state;
};

const go = (route: RouteKey, params?: Record<string, string | number>) => {
  const sp = new URLSearchParams();
  if (params) for (const [k, v] of Object.entries(params)) sp.set(k, String(v));
  const q = sp.toString();
  window.location.hash = `/${route}${q ? `?${q}` : ""}`;
};

// -----------------------------
// UI Primitives
// -----------------------------
const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ className, ...p }) => (
  <button
    {...p}
    className={classNames(
      "px-4 py-2 rounded-2xl shadow-sm border text-sm font-medium",
      "hover:shadow-md active:scale-[0.99] transition",
      "bg-black text-white border-black",
      className || ""
    )}
  />
);

const Card: React.FC<{
  className?: string;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}> = ({ className, title, children, footer }) => (
  <div className={classNames("rounded-2xl border p-4 shadow-sm bg-white", className)}>
    {title && <div className="text-lg font-semibold mb-2">{title}</div>}
    <div>{children}</div>
    {footer && <div className="pt-3 mt-3 border-t">{footer}</div>}
  </div>
);

// -----------------------------
// Layout Shell
// -----------------------------
const Header: React.FC<{ cartCount: number; onSearch: (q: string) => void }> = ({
  cartCount,
  onSearch,
}) => {
  const [q, setQ] = useState("");
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
      <div className="max-w-6xl mx-auto px-3 py-3 flex items-center gap-3">
        <a
          className="text-xl font-bold tracking-tight cursor-pointer"
          onClick={() => go("home")}
        >
          SportX
        </a>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          <a onClick={() => go("categories")} className="cursor-pointer hover:underline">
            Danh mục
          </a>
          <a onClick={() => go("discounts")} className="cursor-pointer hover:underline">
            Khuyến mãi
          </a>
          <a onClick={() => go("reports")} className="cursor-pointer hover:underline">
            Báo cáo
          </a>
          <a onClick={() => go("shipping")} className="cursor-pointer hover:underline">
            Vận chuyển
          </a>
        </nav>
        <div className="flex-1" />
        <div className="flex items-center gap-2 w-full max-w-md border rounded-2xl px-3 py-1.5 bg-white">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch(q)}
            placeholder="Tìm sản phẩm, thương hiệu..."
            className="w-full outline-none text-sm"
          />
          <Button onClick={() => onSearch(q)} className="bg-gray-900 border-gray-900">
            Tìm
          </Button>
        </div>
        <Button onClick={() => go("cart")} className="ml-2 relative">
          Giỏ hàng
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {cartCount}
            </span>
          )}
        </Button>
        <Button onClick={() => go("auth")} className="bg-white text-black border-gray-300">
          Đăng nhập
        </Button>
      </div>
    </header>
  );
};

const Footer: React.FC = () => (
  <footer className="border-t mt-10">
    <div className="max-w-6xl mx-auto px-3 py-6 text-sm text-gray-600 flex flex-col md:flex-row gap-2 md:gap-6">
      <div>© {new Date().getFullYear()} SportX. All rights reserved.</div>
      <div className="flex gap-4">
        <a className="hover:underline cursor-pointer" onClick={() => go("support")}>
          Hỗ trợ
        </a>
        <a className="hover:underline cursor-pointer" onClick={() => go("profile")}>
          Tài khoản
        </a>
        <a className="hover:underline cursor-pointer" onClick={() => go("orders")}>
          Đơn hàng
        </a>
        <a className="hover:underline cursor-pointer" onClick={() => go("reviews")}>
          Đánh giá
        </a>
      </div>
      <div className="flex-1" />
      <div className="text-gray-500">Made with ❤</div>
    </div>
  </footer>
);

// -----------------------------
// Pages
// -----------------------------
const HomePage: React.FC<{ products: Product[] }> = ({ products }) => {
  const featured = products.slice(0, 3);
  const categories = Array.from(new Set(products.map((p) => p.category)));

  return (
    <div className="max-w-6xl mx-auto px-3 py-6">
      {/* Hero */}
      <div className="rounded-2xl p-8 bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow">
        <div className="text-2xl font-semibold">Mega Sale Tháng 10</div>
        <div className="text-sm opacity-90 mt-1">
          Giảm đến 40% cho đồ thể thao & giày chạy
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="bg-white text-black border-white" onClick={() => go("discounts")}>
            Xem ưu đãi
          </Button>
          <Button className="bg-black border-black" onClick={() => go("categories")}>
            Mua ngay
          </Button>
        </div>
      </div>

      {/* Danh mục khuyến mãi / quảng cáo */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Danh mục khuyến mãi</h2>
          <a className="text-sm underline cursor-pointer" onClick={() => go("discounts")}>
            Xem tất cả
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {PROMOS.map((p) => (
            <Card
              key={p.id}
              className="overflow-hidden"
              footer={<Button onClick={() => go(p.cta.to)}>{p.cta.label}</Button>}
            >
              <img src={p.image} alt={p.title} className="w-full h-36 object-cover rounded-xl mb-3" />
              <div className="font-medium">{p.title}</div>
              <div className="text-sm text-gray-600">{p.desc}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Danh mục sản phẩm */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Danh mục sản phẩm</h2>
          <a className="text-sm underline cursor-pointer" onClick={() => go("categories")}>
            Duyệt tất cả
          </a>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((c) => (
            <Card
              key={c}
              className="overflow-hidden cursor-pointer hover:shadow-md transition"
              footer={
                <Button className="bg-white text-black border-gray-300" onClick={() => go("categories", { c })}>
                  Xem {c}
                </Button>
              }
            >
              <img
                src={CATEGORY_IMAGES[c] || CATEGORY_IMAGES["Quần áo"]}
                alt={c}
                className="w-full h-36 object-cover rounded-xl mb-3"
              />
              <div className="font-medium">{c}</div>
              <div className="text-sm text-gray-600">
                Sản phẩm nổi bật • Ưu đãi đang diễn ra
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Sản phẩm nổi bật */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Sản phẩm nổi bật</h2>
          <a className="text-sm underline cursor-pointer" onClick={() => go("categories")}>
            Xem thêm
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {featured.map((p) => (
            <Card
              key={p.id}
              title={p.name}
              footer={<Button onClick={() => go("product", { id: p.id })}>Xem chi tiết</Button>}
            >
              <img src={p.image} alt={p.name} className="w-full h-44 object-cover rounded-xl mb-3" />
              <div className="text-sm text-gray-600">
                {p.brand} • {p.category}
              </div>
              <div className="mt-1 font-semibold">{currency(p.price)}</div>
              <div className="text-xs text-gray-500">
                Còn {p.stock} sp • ⭐ {p.rating}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductPage: React.FC<{ product: Product; addToCart: (p: Product) => void }> = ({
  product,
  addToCart,
}) => {
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(product.sizes?.[0] || "");
  const inStock = product.stock > 0;
  return (
    <div className="max-w-6xl mx-auto px-3 py-6 grid md:grid-cols-2 gap-6">
      <img src={product.image} alt={product.name} className="w-full h-96 object-cover rounded-2xl" />
      <div>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <div className="text-gray-600 text-sm mt-1">
          {product.brand} • {product.category}
        </div>
        <div className="mt-2 text-xl font-bold">{currency(product.price)}</div>
        <div className="text-sm text-gray-500">Tồn kho: {product.stock}</div>
        <p className="mt-4 text-sm leading-6 text-gray-700">{product.description}</p>

        <div className="mt-4 flex gap-3 items-center">
          <div className="text-sm text-gray-600">Màu:</div>
          <div className="flex gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={classNames("w-8 h-8 rounded-full border", color === c ? "ring-2 ring-black" : "")}
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
        </div>

        {product.sizes && (
          <div className="mt-4 flex gap-2 items-center">
            <div className="text-sm text-gray-600">Size:</div>
            <div className="flex gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={classNames(
                    "px-3 py-1 rounded-xl border text-sm",
                    size === s ? "bg-black text-white border-black" : "bg-white"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <Button disabled={!inStock} onClick={() => addToCart(product)}>
            {inStock ? "Thêm vào giỏ" : "Hết hàng"}
          </Button>
          <Button className="bg-white text-black border-gray-300" onClick={() => go("reviews", { id: product.id })}>
            Xem đánh giá
          </Button>
        </div>

        <div className="mt-6 text-sm text-gray-600">
          <div>⭐ {product.rating} / 5</div>
          <div className="mt-1">
            Sản phẩm liên quan:{" "}
            <a className="underline cursor-pointer" onClick={() => go("categories", { c: product.category })}>
              {product.category}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoriesPage: React.FC<{ products: Product[]; initialCategory?: string }> = ({
  products,
  initialCategory,
}) => {
  const categories = Array.from(new Set(products.map((p) => p.category)));
  const [selected, setSelected] = useState<string | "all">("all");
  const [brand, setBrand] = useState<string | "all">("all");
  const [price, setPrice] = useState<[number, number]>([0, 2_000_000]);

  useEffect(() => {
    if (initialCategory && categories.includes(initialCategory)) {
      setSelected(initialCategory);
    }
  }, [initialCategory, categories]);

  const brands = Array.from(new Set(products.map((p) => p.brand)));

  const filtered = products.filter((p) => {
    const inCat = selected === "all" || p.category === selected;
    const inBrand = brand === "all" || p.brand === brand;
    const inPrice = p.price >= price[0] && p.price <= price[1];
    return inCat && inBrand && inPrice;
  });

  return (
    <div className="max-w-6xl mx-auto px-3 py-6">
      <div className="flex flex-wrap gap-2 items-center">
        <div className="text-sm">Danh mục:</div>
        <select className="border rounded-xl px-3 py-1" value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="all">Tất cả</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="text-sm">Thương hiệu:</div>
        <select className="border rounded-xl px-3 py-1" value={brand} onChange={(e) => setBrand(e.target.value)}>
          <option value="all">Tất cả</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <div className="text-sm">Giá:</div>
        <input
          type="number"
          className="border rounded-xl px-2 py-1 w-24"
          value={price[0]}
          onChange={(e) => setPrice([Number(e.target.value), price[1]])}
        />
        <span>—</span>
        <input
          type="number"
          className="border rounded-xl px-2 py-1 w-24"
          value={price[1]}
          onChange={(e) => setPrice([price[0], Number(e.target.value)])}
        />
      </div>
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        {filtered.map((p) => (
          <Card key={p.id} title={p.name} footer={<Button onClick={() => go("product", { id: p.id })}>Xem</Button>}>
            <img src={p.image} alt={p.name} className="w-full h-40 object-cover rounded-xl mb-3" />
            <div className="text-sm text-gray-600">
              {p.brand} • {p.category}
            </div>
            <div className="mt-1 font-semibold">{currency(p.price)}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const CartPage: React.FC<{
  cart: CartItem[];
  onRemove: (id: string) => void;
  onQty: (id: string, qty: number) => void;
}> = ({ cart, onRemove, onQty }) => {
  const subtotal = cart.reduce((s, c) => s + c.product.price * c.qty, 0);
  return (
    <div className="max-w-4xl mx-auto px-3 py-6">
      <h1 className="text-2xl font-semibold mb-4">Giỏ hàng</h1>
      {cart.length === 0 ? (
        <Card>
          Giỏ hàng trống.{" "}
          <a className="underline cursor-pointer" onClick={() => go("home")}>
            Tiếp tục mua sắm
          </a>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 flex flex-col gap-3">
            {cart.map(({ product, qty }) => (
              <Card key={product.id}>
                <div className="flex items-center gap-3">
                  <img src={product.image} className="w-24 h-24 object-cover rounded-xl" />
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">
                      {currency(product.price)} • Kho: {product.stock}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={qty}
                        onChange={(e) => onQty(product.id, Math.max(1, Number(e.target.value)))}
                        className="w-20 border rounded-xl px-2 py-1"
                      />
                      <Button className="bg-white text-black border-gray-300" onClick={() => onRemove(product.id)}>
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div>
            <Card title="Tổng kết" footer={<Button onClick={() => go("checkout")}>Thanh toán</Button>}>
              <div className="flex justify-between text-sm">
                <span>Tạm tính</span>
                <span>{currency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Thuế (8%)</span>
                <span>{currency(subtotal * 0.08)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Phí vận chuyển (ước tính)</span>
                <span>{currency(30000)}</span>
              </div>
              <div className="flex justify-between font-semibold mt-3 text-lg">
                <span>Tổng</span>
                <span>{currency(subtotal * 1.08 + 30000)}</span>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckoutPage: React.FC<{
  user: User | null;
  cart: CartItem[];
  coupons: State["coupons"];
  onPlaceOrder: (o: Order) => void;
}> = ({ user, cart, coupons, onPlaceOrder }) => {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [addr, setAddr] = useState(user?.shippingAddress || "123 Nguyễn Huệ, Q.1, TP.HCM");
  const [code, setCode] = useState("");

  const subtotal = cart.reduce((s, c) => s + c.product.price * c.qty, 0);
  const tax = subtotal * 0.08;
  const ship = 30000;

  const coupon = coupons.find((c) => c.code === code && c.active);
  const discount = coupon ? (coupon.type === "percent" ? (subtotal * coupon.value) / 100 : coupon.value) : 0;
  const total = Math.max(0, subtotal + tax + ship - discount);

  const place = () => {
    const order: Order = {
      id: `o${Math.floor(Math.random() * 90000) + 10000}`,
      items: cart,
      total,
      createdAt: new Date().toISOString(),
      status: "processing",
    };
    onPlaceOrder(order);
    go("orders");
  };

  return (
    <div className="max-w-5xl mx-auto px-3 py-6 grid md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <Card title="Thông tin giao hàng">
          <div className="grid md:grid-cols-2 gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Họ tên" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="border rounded-xl px-3 py-2" placeholder="Số điện thoại" />
            <input value={addr} onChange={(e) => setAddr(e.target.value)} className="border rounded-xl px-3 py-2 md:col-span-2" placeholder="Địa chỉ giao hàng" />
          </div>
        </Card>
        <Card title="Phương thức thanh toán" className="mt-3">
          <div className="flex gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input type="radio" name="pay" defaultChecked /> Thẻ/ Ví điện tử
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="pay" /> COD (khi nhận hàng)
            </label>
          </div>
        </Card>
      </div>
      <div>
        <Card title="Đơn hàng">
          <div className="text-sm text-gray-600">{cart.length} sản phẩm</div>
          <div className="max-h-56 overflow-auto mt-2 flex flex-col gap-2">
            {cart.map(({ product, qty }) => (
              <div key={product.id} className="flex justify-between text-sm">
                <span>
                  {product.name} × {qty}
                </span>
                <span>{currency(product.price * qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} className="border rounded-xl px-3 py-2 flex-1" placeholder="Mã giảm giá" />
            <Button className="bg-white text-black border-gray-300">Áp dụng</Button>
          </div>
          <div className="flex justify-between text-sm mt-3">
            <span>Tạm tính</span>
            <span>{currency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>Giảm</span>
            <span>-{currency(discount)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>Thuế</span>
            <span>{currency(tax)}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span>Vận chuyển</span>
            <span>{currency(ship)}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg mt-3">
            <span>Tổng</span>
            <span>{currency(total)}</span>
          </div>
          <Button className="w-full mt-4" onClick={place} disabled={cart.length === 0}>
            Đặt hàng
          </Button>
        </Card>
      </div>
    </div>
  );
};

const AuthPage: React.FC = () => (
  <div className="max-w-md mx-auto px-3 py-10">
    <Card
      title="Đăng nhập / Đăng ký"
      footer={
        <div className="text-xs text-gray-500">
          Quên mật khẩu? <a className="underline" href="#">Khôi phục</a>
        </div>
      }
    >
      <input className="border rounded-xl px-3 py-2 w-full mb-2" placeholder="Email" type="email" />
      <input className="border rounded-xl px-3 py-2 w-full mb-3" placeholder="Mật khẩu" type="password" />
      <Button className="w-full">Tiếp tục</Button>
      <div className="text-center text-sm mt-3 text-gray-600">
        Chưa có tài khoản? <a className="underline cursor-pointer">Đăng ký</a>
      </div>
    </Card>
  </div>
);

const OrdersPage: React.FC<{ orders: Order[] }> = ({ orders }) => (
  <div className="max-w-5xl mx-auto px-3 py-6">
    <h1 className="text-2xl font-semibold mb-4">Lịch sử đơn hàng</h1>
    <div className="grid md:grid-cols-2 gap-4">
      {orders.map((o) => (
        <Card key={o.id} title={`Đơn #${o.id}`}>
          <div className="text-sm text-gray-600">
            Ngày đặt: {new Date(o.createdAt).toLocaleString()}
          </div>
          <div className="text-sm">
            Trạng thái: <span className="font-medium capitalize">{o.status}</span>
          </div>
          <div className="mt-2 flex flex-col gap-1 text-sm">
            {o.items.map(({ product, qty }) => (
              <div key={product.id} className="flex justify-between">
                <span>
                  {product.name} × {qty}
                </span>
                <span>{currency(product.price * qty)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 font-semibold">Tổng: {currency(o.total)}</div>
        </Card>
      ))}
    </div>
  </div>
);

const ProfilePage: React.FC<{ user: User | null; onSave: (u: User) => void }> = ({
  user,
  onSave,
}) => {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [addr, setAddr] = useState(user?.shippingAddress || "");
  return (
    <div className="max-w-lg mx-auto px-3 py-6">
      <Card
        title="Hồ sơ cá nhân"
        footer={<Button onClick={() => onSave({ id: user?.id || "u1", name, email, phone, shippingAddress: addr })}>Lưu</Button>}
      >
        <input className="border rounded-xl px-3 py-2 w-full mb-2" value={name} onChange={(e) => setName(e.target.value)} placeholder="Họ tên" />
        <input className="border rounded-xl px-3 py-2 w-full mb-2" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input className="border rounded-xl px-3 py-2 w-full mb-2" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" />
        <textarea className="border rounded-xl px-3 py-2 w-full" value={addr} onChange={(e) => setAddr(e.target.value)} placeholder="Địa chỉ giao hàng" />
      </Card>
    </div>
  );
};

const ReviewsPage: React.FC<{ product?: Product }> = ({ product }) => (
  <div className="max-w-3xl mx-auto px-3 py-6">
    <Card title={`Đánh giá sản phẩm${product ? ": " + product.name : ""}`}>
      <div className="text-sm text-gray-600 mb-3">
        Hãy chia sẻ cảm nhận của bạn để giúp khách hàng khác.
      </div>
      <select className="border rounded-xl px-3 py-2 mb-2">
        <option>5 sao</option>
        <option>4 sao</option>
        <option>3 sao</option>
        <option>2 sao</option>
        <option>1 sao</option>
      </select>
      <textarea className="border rounded-xl px-3 py-2 w-full min-h-28" placeholder="Viết nhận xét..." />
      <Button className="mt-3">Gửi đánh giá</Button>
    </Card>
  </div>
);

const SupportPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-3 py-6">
    <Card title="Hỗ trợ khách hàng">
      <div className="grid md:grid-cols-2 gap-3">
        <input className="border rounded-xl px-3 py-2" placeholder="Tên của bạn" />
        <input className="border rounded-xl px-3 py-2" placeholder="Email" />
        <textarea className="border rounded-xl px-3 py-2 md:col-span-2" placeholder="Mô tả yêu cầu hỗ trợ / đổi trả" />
        <Button className="md:col-span-2">Gửi yêu cầu</Button>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        Hoặc chat nhanh với CSKH qua live chat ở góc phải màn hình.
      </div>
    </Card>
  </div>
);

const SearchPage: React.FC<{ products: Product[]; query: string }> = ({
  products,
  query,
}) => {
  const q = query.toLowerCase();
  const results = products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
  return (
    <div className="max-w-6xl mx-auto px-3 py-6">
      <h1 className="text-xl font-semibold">
        Kết quả tìm kiếm cho: “{query}”
      </h1>
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        {results.map((p) => (
          <Card
            key={p.id}
            title={p.name}
            footer={<Button onClick={() => go("product", { id: p.id })}>Xem</Button>}
          >
            <img src={p.image} className="w-full h-40 object-cover rounded-xl mb-3" />
            <div className="text-sm text-gray-600">
              {p.brand} • {p.category}
            </div>
            <div className="mt-1 font-semibold">{currency(p.price)}</div>
          </Card>
        ))}
        {results.length === 0 && <Card>Không tìm thấy sản phẩm phù hợp.</Card>}
      </div>
    </div>
  );
};

const DiscountsPage: React.FC<{ coupons: State["coupons"] }> = ({ coupons }) => (
  <div className="max-w-3xl mx-auto px-3 py-6">
    <h1 className="text-2xl font-semibold mb-4">Ưu đãi & Mã giảm giá</h1>
    <div className="grid md:grid-cols-2 gap-4">
      {coupons.map((c) => (
        <Card key={c.code} title={c.code}>
          <div className="text-sm text-gray-600">
            Loại: {c.type === "percent" ? "Phần trăm" : "Số tiền cố định"}
          </div>
          <div className="text-sm">
            Giá trị: {c.type === "percent" ? `${c.value}%` : currency(c.value)}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Áp dụng ở bước thanh toán.
          </div>
        </Card>
      ))}
    </div>
  </div>
);

const ReportsPage: React.FC<{ orders: Order[]; products: Product[] }> = ({
  orders,
  products,
}) => {
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const topProduct = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) =>
      o.items.forEach(
        (it) => (counts[it.product.id] = (counts[it.product.id] || 0) + it.qty)
      )
    );
    const bestId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    return products.find((p) => p.id === bestId) || products[0];
  }, [orders, products]);

  const loyalCustomer = "demo@shop.vn"; // placeholder

  return (
    <div className="max-w-5xl mx-auto px-3 py-6 grid md:grid-cols-3 gap-4">
      <Card title="Doanh thu" className="md:col-span-1">
        <div className="text-2xl font-bold">{currency(revenue)}</div>
        <div className="text-sm text-gray-600">Tổng theo tất cả đơn hàng</div>
      </Card>
      <Card title="Sản phẩm bán chạy" className="md:col-span-1">
        <div className="font-medium">{topProduct.name}</div>
        <img src={topProduct.image} className="w-full h-36 object-cover rounded-xl mt-2" />
      </Card>
      <Card title="Khách hàng trung thành" className="md:col-span-1">
        <div className="font-medium">{loyalCustomer}</div>
        <div className="text-sm text-gray-600">Số đơn: {orders.length}</div>
      </Card>
    </div>
  );
};

const ShippingPage: React.FC = () => (
  <div className="max-w-3xl mx-auto px-3 py-6">
    <h1 className="text-2xl font-semibold mb-4">Quản lý vận chuyển</h1>
    <Card title="Tùy chọn giao hàng">
      <ul className="list-disc pl-5 text-sm">
        <li>Nội tỉnh: 20.000đ (1-2 ngày)</li>
        <li>Ngoại tỉnh: 30.000đ (2-4 ngày)</li>
        <li>Giao nhanh: 60.000đ (Trong ngày, nội thành)</li>
      </ul>
    </Card>
    <Card title="Tính phí vận chuyển" className="mt-3">
      <div className="grid md:grid-cols-3 gap-3">
        <input className="border rounded-xl px-3 py-2" placeholder="Trọng lượng (kg)" />
        <select className="border rounded-xl px-3 py-2">
          <option>Khu vực</option>
          <option>Nội tỉnh</option>
          <option>Ngoại tỉnh</option>
        </select>
        <Button>Tính phí</Button>
      </div>
    </Card>
  </div>
);

// -----------------------------
// App (Router + Store wiring)
// -----------------------------
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { route, params } = useHashRoute();

  const addToCart = (p: Product, qty = 1) =>
    dispatch({ type: "ADD_TO_CART", payload: { product: p, qty } });
  const removeFromCart = (id: string) =>
    dispatch({ type: "REMOVE_FROM_CART", payload: { productId: id } });
  const setQty = (id: string, qty: number) =>
    dispatch({ type: "SET_QTY", payload: { productId: id, qty } });
  const placeOrder = (o: Order) => dispatch({ type: "PLACE_ORDER", payload: o });
  const saveProfile = (u: User) => dispatch({ type: "LOGIN", payload: u });

  const onSearch = (q: string) => go("search", { q });

  const product = params.id ? MOCK_PRODUCTS.find((p) => p.id === params.id) : undefined;
  const query = (params.q as string) || "";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header cartCount={state.cart.length} onSearch={onSearch} />

      {route === "home" && <HomePage products={MOCK_PRODUCTS} />}

      {route === "product" && product && (
        <ProductPage product={product} addToCart={(p) => addToCart(p)} />
      )}

      {route === "categories" && (
        <CategoriesPage products={MOCK_PRODUCTS} initialCategory={params.c} />
      )}

      {route === "cart" && (
        <CartPage cart={state.cart} onRemove={removeFromCart} onQty={setQty} />
      )}

      {route === "checkout" && (
        <CheckoutPage
          user={state.user}
          cart={state.cart}
          coupons={state.coupons}
          onPlaceOrder={placeOrder}
        />
      )}

      {route === "auth" && <AuthPage />}

      {route === "orders" && <OrdersPage orders={state.orders} />}

      {route === "profile" && <ProfilePage user={state.user} onSave={saveProfile} />}

      {route === "reviews" && <ReviewsPage product={product} />}

      {route === "support" && <SupportPage />}

      {route === "search" && <SearchPage products={MOCK_PRODUCTS} query={query} />}

      {route === "discounts" && <DiscountsPage coupons={state.coupons} />}

      {route === "reports" && (
        <ReportsPage orders={state.orders} products={MOCK_PRODUCTS} />
      )}

      {route === "shipping" && <ShippingPage />}

      <Footer />
    </div>
  );
}

/** Quick routes:
 *  #/home
 *  #/product?id=p1
 *  #/categories
 *  #/categories?c=Giày
 *  #/cart
 *  #/checkout
 *  #/auth
 *  #/orders
 *  #/profile
 *  #/reviews?id=p1
 *  #/support
 *  #/search?q=giay
 *  #/discounts
 *  #/reports
 *  #/shipping
 */
