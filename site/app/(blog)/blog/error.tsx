"use client";

import { BlogErrorState } from "../components/BlogErrorState";

export default function BlogError({ reset }: { reset: () => void }) {
  return (
    <BlogErrorState
      description="Try loading the page again, or return to the field notes."
      reset={reset}
      title="Could not load the field notes."
    />
  );
}
