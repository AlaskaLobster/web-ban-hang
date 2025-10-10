import { supabase } from '../supabaseClient';

export async function isFavorited(userId: string | null, productId: number) {
  if (!userId) return false;
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();
    if (error) {
      console.error('[favorites] isFavorited error:', error.message);
      return false;
    }
    return !!data;
  } catch (e) {
    console.error('[favorites] isFavorited unexpected error', e);
    return false;
  }
}

export async function toggleFavorite(userId: string | null, productId: number) {
  if (!userId) throw new Error('Not authenticated');

  try {
    // Check existing
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (data) {
      // remove by matching user_id + product_id to avoid relying on a specific PK column
      const { error: delErr } = await supabase.from('favorites').delete().match({ user_id: userId, product_id: productId });
      if (delErr) throw delErr;
      return { added: false };
    }

    // insert
    const { error: insErr } = await supabase.from('favorites').insert({ user_id: userId, product_id: productId });
    if (insErr) throw insErr;
    return { added: true };
  } catch (e) {
    throw e;
  }
}
