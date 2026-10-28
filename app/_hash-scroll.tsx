"use client";

import { useEffect } from "react";

const CLEARANCE = 24;

function coverBottom() {
  const toggle = document.querySelector(".qa-language-toggle")?.getBoundingClientRect().bottom ?? 0;
  return Math.max(toggle, 0);
}

function alignHash(force: boolean) {
  const needed = Math.ceil(coverBottom()) + CLEARANCE;
  document.documentElement.style.setProperty("--anchor-scroll-offset", `${needed}px`);
  const id = decodeURIComponent(window.location.hash.replace(/^#/, ""));
  if (!id) return;
  const target = document.getElementById(id);
  if (!target) return;
  const top = target.getBoundingClientRect().top;
  if (!force && (top >= needed - 1 || top < -8)) return;
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  target.scrollIntoView({ block: "start" });
  root.style.scrollBehavior = previous;
}

export function HashScroll() {
  useEffect(() => {
    const correctIfCovered = () => alignHash(false);
    const force = () => alignHash(true);
    const frame = requestAnimationFrame(force);
    const toggle = document.querySelector(".qa-language-toggle");
    const observer = new ResizeObserver(correctIfCovered);
    if (toggle) observer.observe(toggle);
    window.addEventListener("hashchange", force);
    window.addEventListener("resize", correctIfCovered);
    document.fonts?.ready.then(correctIfCovered).catch(() => {});
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("hashchange", force);
      window.removeEventListener("resize", correctIfCovered);
    };
  }, []);
  return null;
}
