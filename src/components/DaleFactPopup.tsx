"use client";

import { useState, useEffect, useCallback } from "react";

const DALE_FACTS = [
  "Did you know Dale Bottomley has a smelly bum?",
  "Did you know Dale Bottomley once got lost in his own garden?",
  "Did you know Dale Bottomley thinks offside is a type of cheese?",
  "Did you know Dale Bottomley irons his socks?",
  "Did you know Dale Bottomley claps when the plane lands?",
  "Did you know Dale Bottomley still uses Internet Explorer?",
  "Did you know Dale Bottomley puts milk in before the tea bag?",
  "Did you know Dale Bottomley wears socks with sandals... on purpose?",
  "Did you know Dale Bottomley once asked for a fork at a sushi restaurant?",
  "Did you know Dale Bottomley thinks a clean sheet is something you put on a bed?",
  "Did you know Dale Bottomley googles 'Google' to get to Google?",
  "Did you know Dale Bottomley waves back at people on TV?",
  "Did you know Dale Bottomley eats Kit Kats without breaking them apart?",
  "Did you know Dale Bottomley calls every dog he sees 'puppy'... even Great Danes?",
  "Did you know Dale Bottomley once tried to pause a live football match with his remote?",
  "Did you know Dale Bottomley thinks VAR is a Viking name?",
  "Did you know Dale Bottomley brings a sleeping bag to sleepovers... at his own house?",
  "Did you know Dale Bottomley still counts on his fingers?",
  "Did you know Dale Bottomley reads the terms and conditions?",
  "Did you know Dale Bottomley thinks 4-4-2 is a maths problem?",
];

export function DaleFactPopup() {
  const [visible, setVisible] = useState(false);
  const [fact, setFact] = useState("");

  const showFact = useCallback(() => {
    const randomFact = DALE_FACTS[Math.floor(Math.random() * DALE_FACTS.length)];
    setFact(randomFact);
    setVisible(true);
  }, []);

  useEffect(() => {
    // Show first popup after 30-60 seconds, then every ~5 minutes
    const initialDelay = 30000 + Math.random() * 30000;
    const initialTimer = setTimeout(() => {
      showFact();
    }, initialDelay);

    const interval = setInterval(() => {
      showFact();
    }, 270000 + Math.random() * 60000); // 4.5-5.5 mins

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [showFact]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-[#1a2634] border border-emerald-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,230,118,0.15)] max-w-md mx-4 p-6 animate-bounce-in">
        <div className="text-center">
          <div className="text-4xl mb-3">🤢</div>
          <h3 className="text-lg font-bold text-gray-100 mb-3">{fact}</h3>
          <button
            onClick={() => setVisible(false)}
            className="mt-2 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors font-medium shadow-[0_0_15px_rgba(0,230,118,0.3)]"
          >
            Disgusting, dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
