"use client";

import { useEffect } from "react";

export function AutoScrollToEditable() {
  useEffect(() => {
    const el = document.getElementById("first-editable-match");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  return null;
}
