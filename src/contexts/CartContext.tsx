// src/contexts/CartContext.tsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

type CartCtx = {
  count: number;
  refresh: () => Promise<void>;
  addLocal: (n: number) => void;
};

const Ctx = createContext<CartCtx>({ count: 0, refresh: async () => {}, addLocal: () => {} });

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.rpc('cart_count');
    if (!error) setCount(Number(data) || 0);
  }, []);

  const addLocal = (n: number) => setCount((c) => Math.max(0, c + n));

  useEffect(() => {
    supabase.auth.getUser().then(
      (res: { data: { user: import('@supabase/supabase-js').User | null } }) => {
        if (res.data?.user) void refresh();
      }
    );

    const { data: authSub } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) void refresh();
        else setCount(0);
      }
    );

    return () => {
      authSub?.subscription.unsubscribe();
    };
  }, [refresh]);

  return <Ctx.Provider value={{ count, refresh, addLocal }}>{children}</Ctx.Provider>;
};

export const useCart = () => useContext(Ctx);
