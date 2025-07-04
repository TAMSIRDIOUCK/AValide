import { supabase } from '../lib/supabaseClient';

export const isSubscriptionActive = async (userId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('seller_id', userId)
    .order('end_date', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return false;

  const now = new Date();
  const endDate = new Date(data.end_date);
  return endDate >= now;
};
