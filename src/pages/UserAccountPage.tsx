import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { User, Phone, MapPin, Save, CheckCircle } from 'lucide-react';

interface UserProfile {
  full_name: string;
  phone: string;
  address: string;
}

interface FormErrors {
  phone?: string;
}

// Utility function để validate phone VN
const validateVNPhone = (phone: string): boolean => {
  const vnPhoneRegex = /^(0|\+84)[3-9][0-9]{8}$/;
  return vnPhoneRegex.test(phone.replace(/\s/g, ''));
};

const UserAccountPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile>({
    full_name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [note, setNote] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        setProfile({
          full_name: data.user.user_metadata?.full_name || '',
          phone: data.user.user_metadata?.phone || '',
          address: data.user.user_metadata?.address || ''
        });
        setLoading(false);
      } else {
        navigate('/auth');  // Nếu chưa đăng nhập, điều hướng về trang đăng nhập
      }
    };

    fetchUser();
  }, [navigate]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (profile.phone && !validateVNPhone(profile.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (VD: 0901234567)';
    } 
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSave = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setNote(null);

    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: profile.full_name,
        phone: profile.phone,
        address: profile.address
      }
    });

    setLoading(false);
    if (error) {
      setNote(error.message);
    } else {
      setNote('Cập nhật thông tin thành công!');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const onSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth');  // Điều hướng về trang đăng nhập sau khi đăng xuất
  };

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-center text-2xl font-semibold">Đang tải tài khoản...</h2>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-semibold mb-6 text-center">Tài Khoản Của Bạn</h2>

        {/* Thông tin tài khoản */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Thông tin cá nhân</h3>
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
            ) : (
              <button
                onClick={onSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Lưu
              </button>
            )}
          </div>

          <div className="mt-4">
            <div className="mb-4">
              <span className="font-semibold">Họ và tên:</span>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full mt-2 p-2 border rounded-lg"
                placeholder="Nhập họ và tên"
              />
            </div>

            <div className="mb-4">
              <span className="font-semibold">Email:</span>
              <p className="mt-2">{user?.email}</p> {/* Email người dùng không thể chỉnh sửa */}
            </div>

            <div className="mb-4">
              <span className="font-semibold">Số điện thoại:</span>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0901234567"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div className="mb-4">
              <span className="font-semibold">Địa chỉ:</span>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  value={profile.address}
                  onChange={(e) => setProfile(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập địa chỉ chi tiết"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                 Địa chỉ này sẽ được sử dụng làm mặc định khi thanh toán
              </p>
            </div>
          </div>
        </div>

        {/* Thông báo */}
        {note && <div className="text-center text-sm text-green-600">{note}</div>}

        {/* Đăng xuất */}
        <div className="text-center mt-8">
          <button
            onClick={onSignOut}
            className="px-6 py-3 bg-red-500 text-white rounded-lg"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    </section>
  );
};

export default UserAccountPage;
