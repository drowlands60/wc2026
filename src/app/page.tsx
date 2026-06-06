import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function HomePage() {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      redirect("/predictions");
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center text-white px-4">
        <h1 className="text-6xl font-bold mb-4 text-emerald-400">World Cup 2026</h1>
        <h2 className="text-2xl mb-2 text-gray-300">Prediction League</h2>
        <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
          Predict scores for every match in the FIFA World Cup 2026. 
          Compete against friends and see who knows football best!
        </p>

        <div className="bg-[#1e2d3d] border border-emerald-500/20 rounded-xl p-6 mb-8 max-w-sm mx-auto shadow-[0_0_30px_rgba(0,230,118,0.1)]">
          <h3 className="font-semibold text-emerald-400 mb-3">Points System</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-300">Exact score</span>
              <span className="font-bold text-yellow-400">3 points</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Correct goal difference</span>
              <span className="font-bold text-cyan-400">2 points</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Correct result</span>
              <span className="font-bold text-orange-400">1 point</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-500 transition-colors shadow-[0_0_15px_rgba(0,230,118,0.3)]"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="border border-emerald-500/50 text-emerald-400 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-500/10 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
