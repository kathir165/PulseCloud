"use client";

import { useEffect, useState } from "react";

export default function RotateToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = document.documentElement;
    if (on) el.dataset.rotate = "on";
    else delete el.dataset.rotate;
    return () => {
      delete el.dataset.rotate;
    };
  }, [on]);

  return (
    <button
      onClick={() => setOn((v) => !v)}
      aria-pressed={on}
      className={`fixed bottom-4 right-4 z-30 hidden rounded-full border px-4 py-2 font-mono text-xs backdrop-blur pointer-coarse:block ${
        on ? "border-accent bg-accent text-navy-950" : "border-line bg-navy-900/85 text-fg"
      }`}
    >
      {on ? "Done" : "Rotate 3D"}
    </button>
  );
}