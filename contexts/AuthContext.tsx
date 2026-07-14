"use client";
<<<<<<< HEAD
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile, createUserProfile } from "@/lib/firestore";
import { UserProfile } from "@/lib/firestore";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
=======

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
<<<<<<< HEAD
  refreshProfile: () => Promise<void>;
=======
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
<<<<<<< HEAD
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (u: User) => {
    let p = await getUserProfile(u.uid);
    if (!p) {
      await createUserProfile(u.uid, u.displayName || "User", u.email || "");
      p = await getUserProfile(u.uid);
    }
    setProfile(p);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) await loadProfile(u);
      else setProfile(null);
      setLoading(false);
    });
    return unsub;
=======
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
<<<<<<< HEAD
    await createUserProfile(cred.user.uid, name, email);
=======
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logOut = async () => {
    await signOut(auth);
<<<<<<< HEAD
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, logOut, refreshProfile }}>
=======
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logOut }}>
>>>>>>> 3b7046a0b58d7708e0e862a897727b2e91e1180c
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
