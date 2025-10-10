
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Star, Loader2 } from 'lucide-react';

type Review = {
  id: number;
  product_id: number;
  user_id: string | null;
  rating: number;
  title?: string | null;
  content?: string | null;
  images?: any;
  status?: string | null;
  created_at?: string | null;
  author_name?: string | null;
};

type Props = { productId: number };

const ProductReviews: React.FC<Props> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRating, setNewRating] = useState<number>(5);
  const [newContent, setNewContent] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        // select reviews and embed profile information when available
        const { data, error } = await supabase
          .from('product_reviews')
          .select('id,product_id,user_id,rating,title,content,images,created_at, profiles(id,full_name,email)')
          .eq('product_id', productId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('[ProductReviews] fetch error', error);
          if (mounted) setReviews([]);
          return;
        }

        // data may include embedded profiles (as 'profiles') when the table exists
        const listRaw = (data || []) as any[];
        const list: Review[] = listRaw.map((r) => ({
          id: r.id,
          product_id: r.product_id,
          user_id: r.user_id,
          rating: r.rating,
          title: r.title,
          content: r.content,
          images: r.images,
          created_at: r.created_at,
          author_name: r.profiles?.full_name || r.profiles?.email || null,
        } as Review));

        if (mounted) setReviews(list);
      } catch (e) {
        console.error('[ProductReviews] unexpected error', e);
        if (mounted) setReviews([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [productId]);

  const submit = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) return alert('Vui lòng đăng nhập để gửi đánh giá');
    if (!newContent.trim()) return alert('Vui lòng nhập nhận xét');

    setSubmitting(true);
    try {
      const payload: any = {
        product_id: productId,
        user_id: user.id,
        rating: newRating,
        title: newTitle || null,
        content: newContent,
      };

      const { data: inserted, error } = await supabase.from('product_reviews').insert(payload).select();
      if (error) {
        console.error('[ProductReviews] insert error', error);
        throw error;
      }

      if (inserted && inserted[0]) {
        const first = inserted[0] as Review;
        const authorName = user.user_metadata?.full_name || user.email || null;
        // Ensure the profiles table has this user's name so it persists after reload.
        try {
          await supabase.from('profiles').upsert({
            id: user.id,
            full_name: authorName,
            email: user.email || null,
            updated_at: new Date().toISOString(),
          });
        } catch (pe) {
          // ignore profile upsert failures (RLS/missing table) but log for debugging
          console.warn('[ProductReviews] profiles upsert failed', pe);
        }

        setReviews((prev) => [{ ...first, author_name: authorName }, ...prev]);
      }

      setNewContent('');
      setNewTitle('');
      setNewRating(5);
      alert('Cảm ơn bạn! Đánh giá của bạn đã được gửi.');
    } catch (e: any) {
      alert('Gửi đánh giá thất bại: ' + (e?.message || String(e)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-3">Đánh giá gần đây</h3>

      {loading ? (
        <div className="text-gray-500 flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Đang tải...</div>
      ) : reviews.length === 0 ? (
        <div className="text-sm text-gray-500">Chưa có đánh giá công khai nào.</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-sm">{r.author_name ?? 'Người dùng'}</div>
                <div className="text-xs text-gray-400">{r.created_at ? new Date(r.created_at).toLocaleString() : ''}</div>
              </div>
              <div className="flex items-center mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <div className="text-sm text-gray-700">{r.title ? <div className="font-semibold">{r.title}</div> : null}{r.content}</div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 border-t pt-4">
        <h4 className="font-semibold mb-2">Gửi đánh giá của bạn</h4>
        <div className="flex items-center gap-2 mb-2">
          <label className="text-sm">Rating:</label>
          <select value={String(newRating)} onChange={(e) => setNewRating(Number(e.target.value))} className="border rounded px-2 py-1 text-sm">
            {[5,4,3,2,1].map((v)=> <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <input value={newTitle} onChange={(e)=>setNewTitle(e.target.value)} placeholder="Tiêu đề (tuỳ chọn)" className="w-full border rounded p-2 mb-2" />
        <textarea value={newContent} onChange={(e)=>setNewContent(e.target.value)} className="w-full border rounded p-2 mb-2" rows={3} />
        <div>
          <button onClick={submit} disabled={submitting} className="px-4 py-2 bg-black text-white rounded-lg">{submitting? 'Đang gửi...' : 'Gửi đánh giá'}</button>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
