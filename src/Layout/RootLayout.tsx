<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { supabase } from '../supabaseClient';

const RootLayout: React.FC = () => {
  const [cartCount, setCartCount] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const location = useLocation();

  // lấy user hiện tại + lắng nghe thay đổi session
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user ?? null);
      setUserId(data.user?.id ?? null);
    };

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event: { eventType: string }, session: { user?: any } | null) => {
        setUser(session?.user ?? null);
        setUserId(session?.user?.id ?? null);
      }
    );

    init();
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // fetch & subscribe cart count theo userId
  useEffect(() => {
    if (!userId) {
      setCartCount(0);
      return;
    }

    let isCancelled = false;

    const loadCount = async () => {
      const { data, error } = await supabase
        .from('cart')
        .select('quantity')
        .eq('user_id', userId);
      if (error || !data) {
        if (!isCancelled) setCartCount(0);
        return;
      }
      const total = data.reduce((sum: number, row: any) => sum + (row.quantity ?? 0), 0);
      if (!isCancelled) setCartCount(total);
    };

    loadCount();

    const channel = supabase
      .channel(`cart-count-${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cart', filter: `user_id=eq.${userId}` },
        () => loadCount()
      )
      .subscribe();

    // cũng reload khi đổi route (đề phòng cập nhật ở trang khác)
    loadCount();

    return () => {
      isCancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId, location.pathname]);

  return (
    <>
      <Header cartCount={cartCount} user={user} />
      <main className="min-h-screen bg-white">
        <Outlet />
      </main>
      <Footer />
=======
import React from 'react';
import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useCart } from '../contexts/CartContext';
import { supabase } from '../supabaseClient';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

export default function RootLayout() {
  const { count, refresh } = useCart();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        if (event === 'SIGNED_IN') {
          refresh(); // Refresh cart when user signs in
        }
        if (event === 'SIGNED_OUT') {
          refresh(); // Refresh cart when user signs out
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [refresh]);

  return (
    <>
      <Header 
        cartCount={count} 
        user={user}
        onAuthChange={refresh}
      />
      <Outlet />
>>>>>>> 2677b87c5b897748881ca224473d1f4876f886a7
    </>
  );
}

