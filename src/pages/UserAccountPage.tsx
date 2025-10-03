import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const UserAccountPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(''); // Thêm email vào form
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
        setFullName(data.user.user_metadata?.full_name || '');
        setEmail(data.user.email || ''); // Lấy email của người dùng
        setPhone(data.user.user_metadata?.phone || '');
        setAddress(data.user.user_metadata?.address || '');
        setLoading(false);
      } else {
        navigate('/auth');  // Nếu chưa đăng nhập, điều hướng về trang đăng nhập
      }
    };

    fetchUser();
  }, [navigate]);

  const onSave = async () => {
    setLoading(true);
    setNote(null);

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, phone, address }, // Cập nhật metadata
    });

    setLoading(false);
    if (error) {
      setNote(error.message);
    } else {
      setNote('Cập nhật thông tin thành công!');
      setEditing(false); // Thoát khỏi chế độ sửa
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
            {editing ? (
              <button
                onClick={onSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Lưu
              </button>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg"
              >
                Chỉnh sửa
              </button>
            )}
          </div>

          <div className="mt-4">
            <div className="mb-4">
              <span className="font-semibold">Họ và tên:</span>
              {editing ? (
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full mt-2 p-2 border rounded-lg"
                  placeholder="Nhập họ và tên"
                />
              ) : (
                <p className="mt-2">{user?.user_metadata?.full_name || 'Chưa cập nhật'}</p>
              )}
            </div>

            <div className="mb-4">
              <span className="font-semibold">Email:</span>
              <p className="mt-2">{user?.email}</p> {/* Email người dùng không thể chỉnh sửa */}
            </div>

            <div className="mb-4">
              <span className="font-semibold">Số điện thoại:</span>
              {editing ? (
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full mt-2 p-2 border rounded-lg"
                  placeholder="Nhập số điện thoại"
                />
              ) : (
                <p className="mt-2">{user?.user_metadata?.phone || 'Chưa cập nhật'}</p>
              )}
            </div>

            <div className="mb-4">
              <span className="font-semibold">Địa chỉ:</span>
              {editing ? (
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full mt-2 p-2 border rounded-lg"
                  placeholder="Nhập địa chỉ"
                />
              ) : (
                <p className="mt-2">{user?.user_metadata?.address || 'Chưa cập nhật'}</p>
              )}
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
