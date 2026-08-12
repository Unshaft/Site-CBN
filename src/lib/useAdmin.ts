"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type AdminState =
  | { status: "loading" }
  | { status: "denied" }
  | { status: "authorized"; user: User };

export function useAdmin(): AdminState {
  const [state, setState] = useState<AdminState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    async function check(user: User | null) {
      if (!user) {
        if (active) setState({ status: "denied" });
        return;
      }
      const { data, error } = await supabase.rpc("is_admin", { uid: user.id });
      if (!active) return;
      setState(!error && data ? { status: "authorized", user } : { status: "denied" });
    }

    supabase.auth.getUser().then(({ data }) => check(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) =>
      check(session?.user ?? null)
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return state;
}
