import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';

interface WishlistContextType {
  wishlistCount: number;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlistCount: 0,
  refreshWishlist: async () => {}
});

export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistCount, setWishlistCount] = useState(0);

  const refreshWishlist = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setWishlistCount(0);
      return;
    }

    const { count } = await supabase
      .from('favorites')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    setWishlistCount(count || 0);
  };

  useEffect(() => {
    refreshWishlist();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshWishlist();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <WishlistContext.Provider value={{ wishlistCount, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}
