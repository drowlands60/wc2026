import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { DaleFactPopup } from "@/components/DaleFactPopup";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "World Cup 2026 Predictor",
  description: "Predict match scores for the FIFA World Cup 2026 and compete with friends",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar user={user ? { email: user.email, id: user.id } : null} />
        <main>{children}</main>
        <DaleFactPopup />
      </body>
    </html>
  );
}
