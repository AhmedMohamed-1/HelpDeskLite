import { useEffect, useState } from "react";
import { ref, onValue, push, set, update } from "firebase/database";
import { firebaseDb } from "./firebase";
import type { Ticket, Status, Note } from "./tickets";
import type { AppUser } from "./auth";

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  useEffect(() => {
    return onValue(ref(firebaseDb(), "tickets"), (snap) => {
      const val = (snap.val() ?? {}) as Record<string, Omit<Ticket, "id">>;
      setTickets(
        Object.entries(val)
          .map(([id, t]) => ({ ...t, id }))
          .sort((a, b) => b.createdAt - a.createdAt),
      );
    });
  }, []);
  return tickets;
}

export function useTicket(id: string) {
  const [ticket, setTicket] = useState<Ticket | null | undefined>(undefined);
  useEffect(() => {
    return onValue(ref(firebaseDb(), `tickets/${id}`), (snap) => {
      const val = snap.val();
      setTicket(val ? { ...val, id } : null);
    });
  }, [id]);
  return ticket;
}

export function useUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  useEffect(() => {
    return onValue(ref(firebaseDb(), "users"), (snap) => {
      const val = (snap.val() ?? {}) as Record<string, Omit<AppUser, "uid">>;
      setUsers(Object.entries(val).map(([uid, u]) => ({ ...u, uid })));
    });
  }, []);
  return users;
}

export async function createTicket(
  data: Pick<Ticket, "title" | "description" | "category" | "priority">,
  submitter: AppUser,
) {
  const node = push(ref(firebaseDb(), "tickets"));
  const now = Date.now();
  await set(node, {
    ...data,
    status: "New" as Status,
    submitterId: submitter.uid,
    submitterName: submitter.name || submitter.email,
    assigneeId: null,
    assigneeName: null,
    createdAt: now,
    updatedAt: now,
  });
  return node.key!;
}

export async function updateTicket(id: string, patch: Partial<Ticket>) {
  await update(ref(firebaseDb(), `tickets/${id}`), { ...patch, updatedAt: Date.now() });
}

export async function addNote(id: string, author: AppUser, body: string) {
  const node = push(ref(firebaseDb(), `tickets/${id}/notes`));
  const note: Omit<Note, "id"> = {
    authorId: author.uid,
    authorName: author.name || author.email,
    body,
    createdAt: Date.now(),
  };
  await set(node, note);
  await update(ref(firebaseDb(), `tickets/${id}`), { updatedAt: Date.now() });
}

export async function setUserRole(uid: string, role: AppUser["role"]) {
  await update(ref(firebaseDb(), `users/${uid}`), { role });
}
