import Link from "next/link";

export default function TicketFiledPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a1628] gap-8">
      <h1 className="text-4xl font-bold text-emerald-400">Your ticket has been filed</h1>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/trash.jpg" alt="Trash" width={400} height={400} className="rounded-lg" />
      <Link href="/submit-ticket" className="text-gray-300 hover:text-emerald-400 underline transition-colors">
        No, I really want to submit a ticket
      </Link>
    </div>
  );
}
