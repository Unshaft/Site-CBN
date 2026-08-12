"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type Mode = "login" | "signup" | "reset";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordIssue(password: string): string | null {
  if (password.length < 8) return "Le mot de passe doit faire au moins 8 caractères.";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  }
  return null;
}

export default function AuthWidget() {
  const [user, setUser] = useState<User | null>(null);
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [claimCode, setClaimCode] = useState("");
  const [showClaimCode, setShowClaimCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setInfo(null);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!EMAIL_RE.test(email)) {
      setError("Adresse email invalide.");
      return;
    }

    if (mode === "reset") {
      setSubmitting(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/espace-membre`,
      });
      setSubmitting(false);
      setInfo(error ? null : "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé.");
      setError(error?.message ?? null);
      return;
    }

    const pwIssue = passwordIssue(password);
    if (pwIssue) {
      setError(pwIssue);
      return;
    }

    if (mode === "signup") {
      if (!prenom.trim() || !nom.trim()) {
        setError("Prénom et nom sont obligatoires.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }

      setSubmitting(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            prenom: prenom.trim(),
            nom: nom.trim(),
            claim_code: claimCode.trim() || null,
          },
        },
      });
      setSubmitting(false);

      if (error) setError(error.message);
      else setInfo("Compte créé — vérifie tes emails pour confirmer ton adresse.");
    } else {
      setSubmitting(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setSubmitting(false);
      if (error) setError("Email ou mot de passe incorrect.");
    }
  }

  async function handleGoogleLogin() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/espace-membre` },
    });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (loading) return null;

  if (user) {
    return (
      <div className="mt-10 flex items-center justify-between rounded-sm border border-ink/10 bg-red-soft/30 px-6 py-4">
        <p className="text-sm text-ink/80">
          Connecté en tant que <span className="font-semibold">{user.email}</span>
        </p>
        <button
          onClick={handleLogout}
          className="text-sm font-semibold text-ink underline decoration-red decoration-2 underline-offset-4"
        >
          Se déconnecter
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-sm border border-ink/10 p-6">
      <div className="flex gap-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
        <button type="button" onClick={() => switchMode("login")} className={mode === "login" ? "text-ink" : ""}>
          Connexion
        </button>
        <button type="button" onClick={() => switchMode("signup")} className={mode === "signup" ? "text-ink" : ""}>
          Inscription
        </button>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-sm border border-ink/15 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink/5"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.66-.22-2.44H12v4.63h6.46c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.93-2.92l-3.88-3c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.3v3.09C3.26 21.3 7.3 24 12 24z" />
          <path fill="#FBBC05" d="M5.31 14.31A7.2 7.2 0 0 1 4.93 12c0-.8.14-1.58.38-2.31V6.6H1.3A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.3 5.4z" />
          <path fill="#EA4335" d="M12 4.77c1.76 0 3.35.6 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0 7.3 0 3.26 2.7 1.3 6.6l4.01 3.09C6.25 6.87 8.89 4.77 12 4.77z" />
        </svg>
        Continuer avec Google
      </button>

      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-widest text-ink/30">
        <div className="h-px flex-1 bg-ink/10" />
        ou
        <div className="h-px flex-1 bg-ink/10" />
      </div>

      {mode !== "reset" ? (
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          {mode === "signup" && (
            <div className="flex gap-3">
              <input
                type="text"
                required
                placeholder="Prénom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                autoComplete="given-name"
                className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
              />
              <input
                type="text"
                required
                placeholder="Nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                autoComplete="family-name"
                className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
              />
            </div>
          )}
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
          />
          {mode === "signup" && (
            <input
              type="password"
              required
              minLength={8}
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
            />
          )}

          {mode === "signup" && !showClaimCode && (
            <button
              type="button"
              onClick={() => setShowClaimCode(true)}
              className="block text-sm text-ink/50 underline decoration-ink/20 underline-offset-4"
            >
              Un parent t&apos;a donné un code pour récupérer ton profil ?
            </button>
          )}
          {mode === "signup" && showClaimCode && (
            <input
              type="text"
              placeholder="Code de rattachement"
              value={claimCode}
              onChange={(e) => setClaimCode(e.target.value)}
              className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
            />
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-sm bg-ink px-5 py-2.5 text-sm font-semibold text-feather transition-colors hover:bg-ink-deep disabled:opacity-50"
          >
            {submitting ? "..." : mode === "signup" ? "Créer mon compte" : "Se connecter"}
          </button>

          {mode === "login" && (
            <button
              type="button"
              onClick={() => switchMode("reset")}
              className="block text-sm text-ink/50 underline decoration-ink/20 underline-offset-4"
            >
              Mot de passe oublié ?
            </button>
          )}

          {error && <p role="alert" className="text-sm text-red-deep">{error}</p>}
          {info && <p className="text-sm text-ink/70">{info}</p>}
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <p className="text-sm text-ink/60">
            Indique ton email, on t&apos;envoie un lien pour réinitialiser ton mot de passe.
          </p>
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="w-full rounded-sm border border-ink/15 px-3 py-2 text-sm"
          />
          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center rounded-sm bg-ink px-5 py-2.5 text-sm font-semibold text-feather transition-colors hover:bg-ink-deep disabled:opacity-50"
            >
              {submitting ? "..." : "Envoyer le lien"}
            </button>
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="text-sm text-ink/50 underline decoration-ink/20 underline-offset-4"
            >
              Retour
            </button>
          </div>
          {error && <p role="alert" className="text-sm text-red-deep">{error}</p>}
          {info && <p className="text-sm text-ink/70">{info}</p>}
        </form>
      )}
    </div>
  );
}
