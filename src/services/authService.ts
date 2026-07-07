import { supabase } from './supabaseClient';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    if (error) throw error;
    return { token: data.session?.access_token, user: data.user };
  },

  register: async (data: { email: string; password: string; name?: string }) => {
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { display_name: data.name },
      },
    });
    if (error) throw error;
    return { token: signUpData.session?.access_token, user: signUpData.user };
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
};