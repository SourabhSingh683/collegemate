
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  year: string | null;
  branch: string | null;
  bio: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      setUser(session?.user || null);
      setSession(session || null);
      setIsLoading(false);
    };

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session?.user?.id);
      setUser(session?.user || null);
      setSession(session || null);
    });

    // THEN check for existing session
    loadSession();

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          console.log("Fetching profile for user:", user.id);
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (error) {
            console.error("Error fetching profile:", error);
          }

          // If profile doesn't exist or doesn't have year field, create or update it
          if (!profileData) {
            console.log("Profile not found, creating new profile for user:", user.id);
            
            const metadata = user.user_metadata;
            const username = metadata?.username || user.email?.split('@')[0] || 'user';
            const fullName = metadata?.full_name || '';
            
            console.log("Creating profile with metadata:", { username, fullName });
            
            // Create a new profile
            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  username: username,
                  full_name: fullName,
                  year: '3rd Year', // Default value
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                }
              ])
              .select('*')
              .single();
              
            if (insertError) {
              console.error("Error creating new profile:", insertError);
            } else {
              console.log("New profile created:", newProfile);
              setProfile(newProfile);
              return;
            }
          } else if (!profileData.year) {
            // Update existing profile with default year
            const { data: updatedProfile, error: updateError } = await supabase
              .from('profiles')
              .update({ year: '3rd Year' })
              .eq('id', user.id)
              .select('*')
              .single();
              
            if (updateError) {
              console.error("Error updating profile with default year:", updateError);
            } else {
              console.log("Profile updated with default year:", updatedProfile);
              setProfile(updatedProfile);
              return;
            }
          }

          console.log("Using existing profile:", profileData);
          setProfile(profileData || null);
        } catch (error) {
          console.error("Unexpected error fetching profile:", error);
        }
      } else {
        setProfile(null);
      }
    };

    // Use setTimeout to prevent auth deadlock
    if (user) {
      setTimeout(() => {
        fetchProfile();
      }, 0);
    }
  }, [user]);

  // Sign in function using email + password
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      // Auth state change will be handled by the listener
    } catch (error: any) {
      console.error("Error signing in:", error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error: any) {
      console.error("Error signing out:", error.message);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      try {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error("Error refreshing profile:", error);
        }

        setProfile(profileData || null);
      } catch (error) {
        console.error("Unexpected error refreshing profile:", error);
      }
    } else {
      setProfile(null);
    }
  }, [user]);

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
