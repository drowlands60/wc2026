"use client";

import { useMemo } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { use } from "react";

const VALID_SLUGS: Record<string, string> = {
  "fifa-rankings": "FIFA World Rankings",
  "form-guide": "Form Guide - Last 10 Matches",
  "fifa-results": "FIFA Match Results",
  "match-stats": "Advanced Match Statistics",
  "player-database": "Player Database & Profiles",
  "group-analysis": "Group Stage Analysis",
  "head-to-head": "Head-to-Head Records",
  "injury-updates": "Injury & Suspension Tracker",
};

const IMAGES = ["/terry1.jpg", "/terry2.jpg"];

// These slugs always show the second image (sitting on ground)
const SECOND_IMAGE_SLUGS = ["match-stats", "group-analysis", "fifa-rankings"];

export default function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const imageIndex = useMemo(
    () => (SECOND_IMAGE_SLUGS.includes(slug) ? 1 : 0),
    [slug]
  );

  if (!VALID_SLUGS[slug]) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="relative w-full max-w-2xl" style={{ height: '42vh' }}>
        <Image
          src={IMAGES[imageIndex]}
          alt="Poor John"
          fill
          className="object-contain rounded-lg shadow-2xl"
          sizes="100vw"
        />
      </div>
      <p className="text-white text-lg mt-4">Poor John</p>
    </div>
  );
}
