"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [chelseaAgreed, setChelseaAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!chelseaAgreed) {
      setError("You must agree that Chelsea are elite cheats to continue.");
      return;
    }
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.user && data.user.identities?.length === 0) {
      setError("An account with this email already exists. Please sign in instead.");
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-[#1e2d3d] border border-emerald-500/20 rounded-2xl shadow-[0_0_40px_rgba(0,230,118,0.1)]">
          <div className="text-center">
            <div className="text-4xl mb-4">📧</div>
            <h2 className="text-2xl font-bold text-white mb-3">Check your email!</h2>
            <p className="text-gray-300 mb-2">
              We&apos;ve sent a confirmation link to <span className="text-emerald-400 font-medium">{email}</span>
            </p>
            <p className="text-gray-400 text-sm mb-6">
              The email comes from Supabase (noreply@mail.app.supabase.io). Check your spam folder if you don&apos;t see it within a minute.
            </p>
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium text-sm">
              Go to sign in →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-[#1e2d3d] border border-emerald-500/20 rounded-2xl shadow-[0_0_40px_rgba(0,230,118,0.1)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-400">⚽ WC 2026</h1>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-300">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-gray-600 bg-[#0f1923] text-white px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-lg border border-gray-600 bg-[#0f1923] text-white px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password (min 6 characters)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="mt-1 block w-full rounded-lg border border-gray-600 bg-[#0f1923] text-white px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              id="chelsea"
              type="checkbox"
              checked={chelseaAgreed}
              onChange={(e) => setChelseaAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-600 bg-[#0f1923] text-emerald-500 focus:ring-emerald-500"
            />
            <label htmlFor="chelsea" className="text-sm text-gray-300">
              I agree Chelsea are elite cheats
            </label>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 p-3 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#1e2d3d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_15px_rgba(0,230,118,0.3)]"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
