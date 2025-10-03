import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';
const Auth: React.FC = () => {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Trường họ và tên
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); // Trạng thái ẩn/hiện mật khẩu

  const navigate = useNavigate();

  const onSignUp = async () => {
    setLoading(true);
    setNote(null);

    const redirectTo = window.location.origin + "/user-account";  // Điều hướng sau khi xác nhận

    const { error } = await supabase.auth.signUp(
      { email, password },
      {
        data: { full_name: fullName },  // Lưu họ và tên vào metadata
        redirectTo
      }
    );

    setLoading(false);
    if (error) {
      setNote(error.message);
    } else {
      setNote('Đăng ký thành công! Vui lòng kiểm tra email xác minh.');
      setTab('signin');
    }
  };

  const onSignIn = async () => {
    setLoading(true);
    setNote(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (error) {
      setNote(error.message);
    } else {
      navigate('/user-account');
    }
  };

  const onForgotPassword = async () => {
    setLoading(true);
    setNote(null);

    const { error } = await supabase.auth.api.resetPasswordForEmail(email);

    setLoading(false);
    if (error) {
      setNote(error.message);
    } else {
      setNote('Đã gửi email hướng dẫn thay đổi mật khẩu. Vui lòng kiểm tra email của bạn.');
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);  // Chuyển đổi trạng thái ẩn/hiện mật khẩu
  };

  return (
    <section className="container mx-auto px-4 py-16 max-w-md">
      <h1 className="text-2xl md:text-3xl font-black text-center mb-8">Tài khoản</h1>

      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setTab('signin')}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
            tab === 'signin' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-black'
          }`}
        >
          Đăng nhập
        </button>
        <button
          onClick={() => setTab('signup')}
          className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
            tab === 'signup' ? 'bg-black text-white border-black' : 'bg-white text-gray-700 border-gray-300 hover:border-black'
          }`}
        >
          Đăng ký
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-6 border">
        {tab === 'signup' && (
          <>
            <label className="block text-sm font-medium mb-1">Họ và tên</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
              placeholder="Họ và tên"
            />
          </>
        )}

        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 mb-4"
          placeholder="you@example.com"
        />

        <label className="block text-sm font-medium mb-1">Mật khẩu</label>
<div className="relative">
  <input
    type={showPassword ? 'text' : 'password'}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full border rounded-lg px-3 py-2 mb-6"
    placeholder="••••••••"
  />
  <button
    onClick={togglePassword}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
  >
    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
  </button>
</div>


        {note && <div className="text-sm text-red-600 mb-4">{note}</div>}

        <button
          onClick={tab === 'signin' ? onSignIn : onSignUp}
          disabled={loading}
          className="w-full bg-black hover:bg-orange-500 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {tab === 'signin' ? 'Đăng nhập' : 'Đăng ký'}
        </button>

        <button
          onClick={onForgotPassword}
          className="text-sm text-blue-500 hover:underline"
        >
          Quên mật khẩu?
        </button>

        <button
          onClick={() => setTab(tab === 'signin' ? 'signup' : 'signin')}
          className="mt-4 w-full border hover:border-black py-2.5 rounded-lg font-semibold"
        >
          {tab === 'signin' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
        </button>
      </div>
    </section>
  );
};

export default Auth;
