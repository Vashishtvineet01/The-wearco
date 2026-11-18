"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";

const STUDIO_STORIES = [
  {
    initials: "KR",
    name: "Kavya Rao",
    handle: "@kavyabuilds",
    role: "Team order",
    piece: "Custom hoodies × 24",
    tone: "#b45309",
    quote:
      "Ordered branded hoodies for the launch team. Studio mockup made approvals easy — they landed in a week.",
  },
  {
    initials: "AN",
    name: "Arjun Nair",
    handle: "@arjunwrites",
    role: "Solo print",
    piece: "Offline Mode Tee",
    tone: "#92400e",
    quote:
      "Bought a ready tee from the shop, then customized a second one with my newsletter logo. Both feel premium.",
  },
  {
    initials: "PM",
    name: "Priya Mehta",
    handle: "@priyacreates",
    role: "Poster drop",
    piece: "Studio Print Poster",
    tone: "#6b4f35",
    quote:
      "Printed menu art as posters for the restaurant. Uploaded the file, picked A2, done.",
  },
  {
    initials: "ZS",
    name: "Zaid Sheikh",
    handle: "@zaidbuilds",
    role: "Merch pack",
    piece: "Caps + badges",
    tone: "#5a4e42",
    quote:
      "Mixed caps and badges for a beta meetup. Guest checkout was quick; tracking was clear.",
  },
] as const;

const AUTO_MS = 6000;

export default function StudioStories() {
  const [index, setIndex] = useState(0);
  const total = STUDIO_STORIES.length;
  const story = STUDIO_STORIES[index];

  const go = useCallback(
    (next: number) => {
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  useEffect(() => {
    const id = window.setInterval(() => go(index + 1), AUTO_MS);
    return () => window.clearInterval(id);
  }, [go, index]);

  return (
    <section id="worn-by" className="relative overflow-hidden border-y border-paper-200">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-20">
        <ScrollReveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <div className="flex items-center gap-3">
                <span aria-hidden className="h-px w-8 bg-paper-400" />
                <div className="font-mono text-[11px] uppercase tracking-[0.28em] text-paper-500">
                  Made with Design Studio
                </div>
              </div>
              <h2 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-4xl">
                Real customers. <span className="gradient-text">Real prints.</span>
              </h2>
              <p className="mt-3 text-sm text-paper-600 md:text-base">
                People using the shop and studio for everyday wear, teams and walls.
              </p>
            </div>
            <Link
              href="/design"
              className="text-sm font-semibold text-paper-900 underline-offset-4 hover:underline"
            >
              Start your design →
            </Link>
          </div>
        </ScrollReveal>

        <div className="relative mx-auto mt-10 max-w-xl">
          <blockquote
            key={story.handle}
            className="animate-fade-in-up flex flex-col rounded-2xl border border-paper-200 bg-paper-50/90 p-6 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <span
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full font-display text-sm font-bold text-[#fff8eb]"
                style={{ background: story.tone }}
              >
                {story.initials}
              </span>
              <div className="min-w-0">
                <div className="truncate font-semibold text-paper-900">{story.name}</div>
                <div className="truncate font-mono text-[10px] uppercase tracking-[0.16em] text-paper-500">
                  {story.handle} · {story.role}
                </div>
              </div>
            </div>
            <p className="mt-5 text-lg leading-relaxed text-paper-800">
              “{story.quote}”
            </p>
            <div className="mt-5 flex items-center justify-between gap-3 border-t border-paper-200 pt-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper-500">
                Ordered
              </span>
              <span className="font-semibold text-paper-900">{story.piece}</span>
            </div>
          </blockquote>

          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="rounded-full border border-paper-300 bg-white/70 px-4 py-2 text-sm font-semibold text-paper-900 transition hover:border-paper-900 hover:bg-white"
              aria-label="Previous story"
            >
              ← Prev
            </button>

            <div className="flex items-center gap-2" role="tablist" aria-label="Stories">
              {STUDIO_STORIES.map((s, i) => (
                <button
                  key={s.handle}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Show ${s.name}`}
                  onClick={() => go(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index
                      ? "w-6 bg-[#b45309]"
                      : "w-2 bg-paper-300 hover:bg-paper-500"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(index + 1)}
              className="rounded-full border border-paper-300 bg-white/70 px-4 py-2 text-sm font-semibold text-paper-900 transition hover:border-paper-900 hover:bg-white"
              aria-label="Next story"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
