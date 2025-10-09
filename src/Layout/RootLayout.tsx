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
    </>
  );
}

