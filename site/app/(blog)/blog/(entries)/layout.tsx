import type { ReactNode } from "react";
import { BlogFooter, BlogNav } from "../../components/BlogChrome";

export default function BlogEntryLayout({
  children,
}: Readonly<{
  children: ReactNode;
  }>) {
  return (
    <main className="min-h-screen bg-[var(--paper)]">
      <BlogNav />
      {children}
      <BlogFooter />
    </main>
  );
}
