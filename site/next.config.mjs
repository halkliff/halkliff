import createMDX from "@next/mdx";
import { fileURLToPath } from "node:url";

const rehypeShikiPlugin = fileURLToPath(
  new URL("./lib/markdown/rehype-shiki.mjs", import.meta.url),
);

const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: [rehypeShikiPlugin],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  async redirects() {
    return [
      {
        source: "/writing",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/writing/:path*",
        destination: "/blog/:path*",
        permanent: true,
      },
    ];
  },
  experimental: {
    // Next's CLI checker defaults to true in Next 16. TypeScript 7 is kept
    // as the project compiler, while the app and notebook use the official
    // TypeScript 6 compatibility API (`typescript`) for API-based checks.
    useTypeScriptCli: false,
  },
};

export default withMDX(nextConfig);
