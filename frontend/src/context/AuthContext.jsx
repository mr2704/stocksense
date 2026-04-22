import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch Profile ─────────────────────────────────────────
  const fetchProfile = async (authUser) => {
    if (!authUser) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.warn("[AuthContext] profile fetch:", error.message);
      }

      setProfile(data || null);
    } catch (err) {
      console.error("[AuthContext] fetchProfile error:", err);
    }
  };

  // ── Initial Session + Listener ────────────────────────────
  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authUser = session?.user ?? null;
      setUser(authUser);

      fetchProfile(authUser).finally(() => setLoading(false));
    });

    // Listen for auth changes
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        const authUser = session?.user ?? null;
        setUser(authUser);
        fetchProfile(authUser);
      });

    return () => subscription.unsubscribe();
  }, []);

  // ── SIGNUP (FIXED) ────────────────────────────────────────
  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName, // ✅ store in auth metadata
        },
      },
    });

    if (error) throw error;

    const authUser = data.user;

    if (authUser) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authUser.id,
        full_name: fullName,
        role: "seller",
      });

      if (profileError) {
        console.warn("[AuthContext] profile insert:", profileError.message);
      }
    }

    return data;
  };

  // ── LOGIN ────────────────────────────────────────────────
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return data;
  };

  // ── LOGOUT ───────────────────────────────────────────────
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};