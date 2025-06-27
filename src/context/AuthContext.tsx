import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export interface ExtendedUser extends SupabaseUser {
  name?: string;
  phone?: string;
}

interface AuthContextType {
  user: ExtendedUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  register: (
    data: { name: string; email: string; phone: string },
    password: string
  ) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (session: Session | null) => {
    if (!session?.user) {
      setUser(null);
      return;
    }

    const baseUser = session.user;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('name, phone')
      .eq('id', baseUser.id)
      .maybeSingle(); // ✅ Accepte 0 ou 1 ligne

    if (error) {
      console.error('Erreur chargement du profil :', error.message);
      setUser({ ...baseUser });
    } else {
      setUser({ ...baseUser, ...profile });
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      await loadUserProfile(data?.session || null);
      setLoading(false);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserProfile(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const register = async (
    data: { name: string; email: string; phone: string },
    password: string
  ): Promise<boolean> => {
    const { name, email, phone } = data;

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !signUpData.user) {
      console.error('Erreur inscription :', error?.message);
      return false;
    }

    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: signUpData.user.id,
        name,
        phone,
        email, // Ajout du champ email
      },
    ]);

    if (profileError) {
      console.error('Erreur ajout du profil :', profileError.message);
      return false;
    }

    await loadUserProfile({
      user: signUpData.user,
      access_token: '',
      token_type: '',
      expires_in: 0,
      refresh_token: '',
    });

    return true;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-600">
        Chargement...
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
