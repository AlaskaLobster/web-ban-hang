import React from 'react';

type Props = {
  page: number;
  total: number;      // tổng số item
  pageSize: number;   // số item / trang
  onChange: (page: number) => void;
};

const Pagination: React.FC<Props> = ({ page, total, pageSize, onChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const go = (p: number) => onChange(Math.min(totalPages, Math.max(1, p)));

  // Tạo dải số (1 ... n) ngắn gọn
  const pages: (number | '...')[] = [];
  const window = 1; // số trang kề cận hiện tại 2*window+1
  const add = (n: number | '...') => pages[pages.length - 1] !== n && pages.push(n);

  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= window) {
      add(p);
    } else if (pages[pages.length - 1] !== '...') {
      add('...');
    }
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        className="px-3 py-2 rounded-lg border disabled:opacity-50"
      >
        ← Trước
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-gray-400 select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => go(p)}
            className={`px-3 py-2 rounded-lg border ${
              page === p ? 'bg-black text-white border-black' : 'bg-white hover:border-black'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-2 rounded-lg border disabled:opacity-50"
      >
        Sau →
      </button>
    </div>
  );
};

export default Pagination;
