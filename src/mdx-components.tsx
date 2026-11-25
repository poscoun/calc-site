import type { MDXComponents } from "mdx/types";
import Link from "next/link";

const components: MDXComponents = {
  h1: (p) => <h1 className="text-2xl font-bold leading-snug" {...p} />,
  h2: (p) => <h2 className="mt-10 text-xl font-bold" {...p} />,
  h3: (p) => <h3 className="mt-6 text-lg font-semibold" {...p} />,
  p: (p) => <p className="mt-4 leading-7" {...p} />,
  ul: (p) => <ul className="mt-4 list-disc space-y-1 pl-6" {...p} />,
  ol: (p) => <ol className="mt-4 list-decimal space-y-1 pl-6" {...p} />,
  strong: (p) => <strong className="font-semibold" {...p} />,
  blockquote: (p) => (
    <blockquote className="mt-4 rounded-lg border-l-4 border-black/30 dark:border-white/40 bg-black/[.03] dark:bg-white/[.06] px-4 py-2" {...p} />
  ),
  table: (p) => (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...p} />
    </div>
  ),
  th: (p) => <th className="border-b border-black/20 dark:border-white/30 px-2 py-2 text-left font-semibold" {...p} />,
  td: (p) => <td className="border-b border-black/10 dark:border-white/15 px-2 py-2" {...p} />,
  a: ({ href = "", ...p }) =>
    href.startsWith("/") ? (
      <Link href={href} className="underline underline-offset-2" {...p} />
    ) : (
      <a href={href} className="underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...p} />
    ),
};

export function useMDXComponents(): MDXComponents {
  return components;
}
