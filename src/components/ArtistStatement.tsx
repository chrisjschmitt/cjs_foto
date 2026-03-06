"use client";

import { useState, useEffect } from "react";
import { marked } from "marked";

const FALLBACK_TITLE = "About My Work";
const FALLBACK_BODY = `My work explores the intersections of science, technology, and art. I'm particularly interested in the impact of disruptive technologies on society, and broach on topics such as climate change, poverty, religion and artificial intelligence. Since I'm too lazy to write, I use art as a way of expressing my thoughts.

Each image is an invitation to reflect. For example, I may use obsolete technology to express the current state of the world, or perhaps to envision the future. It's my way of expressing the never-ending cycle of progress, and how we are so deeply affected by it.

Each image is meticulously constructed from highly detailed photographs. I print my artwork on large format, archival paper. It has been exhibited publicly at the Ottawa Art Gallery, Corridor 45|75, the Ottawa City Hall gallery, at the Summerville Art Festival in New Brunswick, and is held in private collections across Canada. Contact info and CV below.`;

export default function ArtistStatement() {
  const [title, setTitle] = useState(FALLBACK_TITLE);
  const [html, setHtml] = useState("");

  useEffect(() => {
    fetch("/api/settings", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (data.statementTitle) setTitle(data.statementTitle);
          const body = data.statementBody || FALLBACK_BODY;
          setHtml(marked.parse(body) as string);
        } else {
          setHtml(marked.parse(FALLBACK_BODY) as string);
        }
      })
      .catch(() => {
        setHtml(marked.parse(FALLBACK_BODY) as string);
      });
  }, []);

  return (
    <section id="statement" className="bg-warm-100/50 py-28 lg:py-36">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <p className="mb-4 text-center text-xs tracking-[0.4em] uppercase text-warm-500">
          Artist Statement
        </p>
        <h2 className="mb-12 text-center font-serif text-4xl font-light text-warm-900 lg:text-5xl">
          {title}
        </h2>
        <div
          className="prose prose-warm mx-auto text-base leading-relaxed text-warm-700 lg:text-lg lg:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  );
}
