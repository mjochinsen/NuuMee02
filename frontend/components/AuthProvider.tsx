'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthChange, logOut } from '@/lib/firebase';
import { UserProfile, getMe, registerUser, loginUser, ApiError } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch or create user profile from backend
  async function syncUserProfile(firebaseUser: User) {
    try {
      const idToken = await firebaseUser.getIdToken();

      // Try to get existing profile
      try {
        const userProfile = await getMe();
        setProfile(userProfile);
        setError(null);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          // User doesn't exist in backend yet, register them
          try {
            await registerUser(idToken);
            // After registration, login to get full profile
            const userProfile = await loginUser(idToken);
            setProfile(userProfile);
            setError(null);
          } catch (registerErr) {
            console.error('Registration failed:', registerErr);
            setError('Failed to create account');
          }
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error('Profile sync failed:', err);
      setError('Failed to sync profile');
    }
  }

  async function refreshProfile() {
    if (user) {
      await syncUserProfile(user);
    }
  }

  async function handleSignOut() {
    await logOut();
    setUser(null);
    setProfile(null);
    setError(null);
  }

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        await syncUserProfile(firebaseUser);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
