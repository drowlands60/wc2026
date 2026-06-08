"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function GroupToggle({ current, sections }: { current: "date" | "group"; sections?: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function toggle(mode: "date" | "group") {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", mode);
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="sticky top-0 z-20 bg-[#0a1628]/95 backdrop-blur-sm py-3 mb-8 space-y-3">
      <div className="flex items-center gap-1 bg-[#1e2d3d] rounded-lg p-1 border border-gray-700/50 w-fit">
        <button
          onClick={() => toggle("date")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            current === "date"
              ? "bg-emerald-600 text-white shadow"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          By Date
        </button>
        <button
          onClick={() => toggle("group")}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            current === "group"
              ? "bg-emerald-600 text-white shadow"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          By Group/Round
        </button>
      </div>
      {current === "group" && sections && sections.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => scrollTo(section.replace(/\s+/g, "-").toLowerCase())}
              className="flex-1 min-w-fit px-2 py-1.5 text-xs rounded-md bg-[#1e2d3d] border border-gray-700/50 text-gray-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors text-center"
            >
              {section}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
