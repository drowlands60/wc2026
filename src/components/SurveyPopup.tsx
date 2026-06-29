"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export function SurveyPopup() {
  const [visible, setVisible] = useState(false);
  const [page, setPage] = useState<"intro" | "questions" | "thanks">("intro");
  const [swapped, setSwapped] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("survey_popup_dismissed");
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem("survey_popup_dismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1e2d3d] border border-gray-700/50 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 relative max-h-[90vh] overflow-y-auto">
        {page === "intro" && (
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full overflow-hidden w-[160px] h-[160px] mb-4">
              <Image
                src="/bad_fraser.png"
                alt="Fraser"
                width={200}
                height={200}
                className="w-full h-full object-cover scale-125"
              />
            </div>
            <p className="text-gray-100 text-lg font-medium mb-6">
              Can I ask you some questions about your experience using the World Cup 2026 Predictions app?
            </p>
            <div className="flex gap-4">
              {swapped ? (
                <>
                  <button
                    onMouseEnter={() => setSwapped(false)}
                    className="px-6 py-2 rounded-lg bg-gray-600 text-gray-200 font-medium hover:bg-gray-500 transition-colors"
                  >
                    No
                  </button>
                  <button
                    onClick={() => setPage("questions")}
                    className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors"
                  >
                    Yes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setPage("questions")}
                    className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors"
                  >
                    Yes
                  </button>
                  <button
                    onMouseEnter={() => setSwapped(true)}
                    className="px-6 py-2 rounded-lg bg-gray-600 text-gray-200 font-medium hover:bg-gray-500 transition-colors"
                  >
                    No
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {page === "questions" && (
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-full overflow-hidden w-[160px] h-[160px] mb-2">
              <Image
                src="/bad_fraser.png"
                alt="Fraser"
                width={200}
                height={200}
                className="w-full h-full object-cover scale-125"
              />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Quick Survey</h2>

            <div className="w-full">
              <label className="block text-gray-300 text-sm font-medium mb-1">
                1. Do you use toothpaste?
              </label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 text-gray-200"><input type="radio" name="q1" value="yes" className="accent-emerald-500" /> Yes</label>
                <label className="flex items-center gap-2 text-gray-200"><input type="radio" name="q1" value="no" className="accent-emerald-500" /> No</label>
              </div>
            </div>

            <div className="w-full">
              <label className="block text-gray-300 text-sm font-medium mb-1">
                2. If I told you about a toothpaste that was better than the toothpaste you use, would you be interested? (It&apos;s really good toothpaste.)
              </label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 text-gray-200"><input type="radio" name="q2" value="yes" className="accent-emerald-500" /> Yes</label>
                <label className="flex items-center gap-2 text-gray-200"><input type="radio" name="q2" value="no" className="accent-emerald-500" /> No</label>
              </div>
            </div>

            <div className="w-full">
              <label className="block text-gray-300 text-sm font-medium mb-1">
                3. What do you most like about toothpaste?
              </label>
              <textarea
                placeholder="Your answer..."
                rows={3}
                className="w-full bg-[#0a1628] border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="w-full">
              <label className="block text-gray-300 text-sm font-medium mb-1">
                4. Can I borrow some toothpaste?
              </label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 text-gray-200"><input type="radio" name="q4" value="yes" className="accent-emerald-500" /> Yes</label>
                <label className="flex items-center gap-2 text-gray-200"><input type="radio" name="q4" value="no" className="accent-emerald-500" /> No</label>
              </div>
            </div>

            <div className="w-full">
              <label className="block text-gray-300 text-sm font-medium mb-1">
                5. Do you have a brush I can use?
              </label>
              <div className="flex gap-4 mt-1">
                <label className="flex items-center gap-2 text-gray-200"><input type="radio" name="q5" value="yes" className="accent-emerald-500" /> Yes</label>
                <label className="flex items-center gap-2 text-gray-200"><input type="radio" name="q5" value="no" className="accent-emerald-500" /> No</label>
              </div>
            </div>

            <button
              onClick={() => setPage("thanks")}
              className="mt-2 w-full px-6 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors"
            >
              Submit
            </button>
          </div>
        )}

        {page === "thanks" && (
          <div className="flex flex-col items-center text-center">
            <div className="rounded-full overflow-hidden w-[160px] h-[160px] mb-4">
              <Image
                src="/bad_fraser.png"
                alt="Fraser"
                width={200}
                height={200}
                className="w-full h-full object-cover scale-125"
              />
            </div>
            <p className="text-gray-100 text-lg font-medium mb-6">
              Thanks we&apos;ll be in touch soon to talk about vacuum cleaners or healthy water.
            </p>
            <button
              onClick={dismiss}
              className="px-6 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
