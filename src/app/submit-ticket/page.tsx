import Link from "next/link";

export default function SubmitTicketPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a1628] gap-24">
      <h1 className="text-7xl font-bold text-emerald-400">Get a life, Jason</h1>
      <Link href="/submit-ticket/filed" className="text-sm text-gray-300 hover:text-emerald-400 underline transition-colors">
        Actually submit a ticket
      </Link>
    </div>
  );
}
