import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth as firebaseAuth, db } from "@/lib/firebase";
import type { Role } from "@/lib/helpdesk";

export function useSession() {
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser({ id: firebaseUser.uid, email: firebaseUser.email });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { session: user ? { user: { id: user.id, email: user.email ?? undefined } } : null, loading, user };
}

export function useRoles(userId?: string) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setRoles([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const userRef = doc(db, "users", userId);
    getDoc(userRef)
      .then((snapshot) => {
        if (!active) return;
        const data = snapshot.exists() ? snapshot.data() : null;
        const nextRoles = Array.isArray(data?.roles) ? (data.roles as Role[]) : (["employee"] as Role[]);
        setRoles(nextRoles);
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setRoles(["employee"]);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [userId]);

  return { roles, loading };
}
