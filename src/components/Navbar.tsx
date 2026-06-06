"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function Navbar({ user }: { user: { email?: string; id: string } | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const links = [
    { href: "/predictions", label: "Predictions" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/matches", label: "Matches" },
    { href: "/resources/fifa-rankings", label: "FIFA Rankings" },
  ];

  const logoHref = user ? "/resources/fifa-rankings" : "/";

  return (
    <nav className="bg-[#0a1628] text-white shadow-[0_4px_20px_rgba(0,230,118,0.15)] border-b border-emerald-500/20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href={logoHref} className="text-xl font-bold flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 3l1.5 5H8.5L9 11h1l.5 3h-1l-.5 2h1.5v1h-1l-.5 1.5h5L14 18h-1v-1h1.5l-.5-2h-1l.5-3h1l.5-3h1L18 3h-2l-.5 2h-1L14 3h-4l-.5 2h-1L8 3H6zm3.5 2h5l-.5 2h-4l-.5-2zM10.5 19h3v1h-3v-1zm-1 1.5h5V21h1v1H8.5v-1h1v-.5z"/>
            </svg>
            <span className="hidden sm:inline">WC 2026 Predictor</span>
            <span className="sm:hidden">WC 2026</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {user && (
              <>
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`hover:text-emerald-400 transition-colors ${
                      pathname === link.href || pathname.startsWith(link.href + "/") ? "text-emerald-400 font-semibold" : "text-gray-300"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  onClick={handleSignOut}
                  className="bg-red-600/80 hover:bg-red-500 px-3 py-1.5 rounded-lg text-sm transition-colors border border-red-500/30"
                >
                  Sign Out
                </button>
              </>
            )}
            {!user && (
              <Link
                href="/login"
                className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg transition-colors font-semibold shadow-[0_0_15px_rgba(0,230,118,0.3)]"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-300 hover:text-emerald-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-emerald-500/20 bg-[#0a1628]">
          <div className="px-4 py-3 space-y-2">
            {user && (
              <>
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-2 px-3 rounded-lg transition-colors ${
                      pathname === link.href ? "text-emerald-400 bg-emerald-500/10 font-semibold" : "text-gray-300 hover:text-emerald-400 hover:bg-emerald-500/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="border-t border-gray-700/50 pt-2 mt-2">
                  <button
                    onClick={() => { handleSignOut(); setMobileOpen(false); }}
                    className="w-full text-left py-2 px-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            )}
            {!user && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block py-2 px-3 text-emerald-400 font-semibold"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
