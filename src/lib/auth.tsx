import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  type User,
} from "firebase/auth";
import { ref, get, set, onValue } from "firebase/database";
import { firebaseAuth, firebaseDb } from "./firebase";
import type { Role } from "./tickets";

export interface AppUser {
  uid: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, role: Role) => Promise<void>;
  signInWithGoogle: (role?: Role) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

const PENDING_ROLE_KEY = "helpdesk-pending-role";


async function ensureProfile(u: User, role: Role) {
  try {
    const existing = await get(ref(firebaseDb(), `users/${u.uid}`));
    if (!existing.exists()) {
      await set(ref(firebaseDb(), `users/${u.uid}`), {
        name: u.displayName ?? u.email ?? "New user",
        email: u.email ?? "",
        role,
        createdAt: Date.now(),
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.toLowerCase().includes("permission")) {
      throw new Error(
        "Signed in, but the database denied saving your profile. In Firebase → Realtime Database → Rules, allow signed-in access: {\"rules\":{\".read\":\"auth != null\",\".write\":\"auth != null\"}}",
      );
    }
    throw err;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Complete a mobile redirect sign-in, if one is pending.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await getRedirectResult(firebaseAuth());
        if (!cancelled && result?.user) {
          const role = (window.sessionStorage.getItem(PENDING_ROLE_KEY) as Role) || "employee";
          window.sessionStorage.removeItem(PENDING_ROLE_KEY);
          await ensureProfile(result.user, role);
        }
      } catch {
        // Ignore: no pending redirect, or it will surface via auth state.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;
    const unsub = onAuthStateChanged(firebaseAuth(), (u) => {
      unsubProfile?.();
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }
      unsubProfile = onValue(ref(firebaseDb(), `users/${u.uid}`), (snap) => {
        const val = snap.val();
        setProfile({
          uid: u.uid,
          email: val?.email ?? u.email ?? "",
          name: val?.name ?? u.displayName ?? u.email ?? "",
          role: (val?.role as Role) ?? "employee",
        });
        setLoading(false);
      });
    });
    return () => {
      unsubProfile?.();
      unsub();
    };
  }, []);

  const value: AuthState = {
    user,
    profile,
    loading,
    signIn: async (email, password) => {
      await signInWithEmailAndPassword(firebaseAuth(), email, password);
    },
    signUp: async (name, email, password, role) => {
      const cred = await createUserWithEmailAndPassword(firebaseAuth(), email, password);
      await updateProfile(cred.user, { displayName: name });
      const existing = await get(ref(firebaseDb(), `users/${cred.user.uid}`));
      if (!existing.exists()) {
        await set(ref(firebaseDb(), `users/${cred.user.uid}`), {
          name,
          email,
          role,
          createdAt: Date.now(),
        });
      }
    },
    signInWithGoogle: async (role: Role = "employee") => {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      // Popup works on mobile too and keeps the session on this origin —
      // full-page redirect loses it on browsers that partition storage.
      window.sessionStorage.setItem(PENDING_ROLE_KEY, role);
      try {
        const cred = await signInWithPopup(firebaseAuth(), provider);
        window.sessionStorage.removeItem(PENDING_ROLE_KEY);
        await ensureProfile(cred.user, role);
      } catch (err) {
        const code = (err as { code?: string })?.code ?? "";
        if (
          code === "auth/popup-blocked" ||
          code === "auth/operation-not-supported-in-this-environment" ||
          code === "auth/cancelled-popup-request"
        ) {
          await signInWithRedirect(firebaseAuth(), provider);
          return;
        }
        throw err;
      }
    },
    signOut: async () => {
      await fbSignOut(firebaseAuth());
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
