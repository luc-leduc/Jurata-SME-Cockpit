import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { useNavigate, useLocation } from 'react-router-dom';
import { userAtom } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useAtom(userAtom);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user && location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user && location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, setUser, location.pathname]);

  // Show nothing while we check the session
  if (location.pathname !== '/login' && !user) {
    return null;
  }

  return children;
}