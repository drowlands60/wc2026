"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
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
  const [imageIndex, setImageIndex] = useState<number | null>(null);

  useEffect(() => {
    if (SECOND_IMAGE_SLUGS.includes(slug)) {
      setImageIndex(1);
    } else {
      setImageIndex(0);
    }
  }, [slug]);

  if (!VALID_SLUGS[slug]) {
    notFound();
  }

  if (imageIndex === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-xl animate-pulse">Loading {VALID_SLUGS[slug]}...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      <img
        src={IMAGES[imageIndex]}
        alt="Poor John"
        className="max-w-full max-h-[70vh] rounded-lg shadow-2xl"
      />
      <p className="text-white text-lg mt-4">Poor John</p>
    </div>
  );
}
