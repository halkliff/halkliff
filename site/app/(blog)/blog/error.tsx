"use client";

import { BlogErrorState } from "../components/BlogErrorState";

export default function BlogError({ reset }: { reset: () => void }) {
  return (
    <BlogErrorState
      description="The field notes hit an unexpected edge case."
      reset={reset}
      title="The index needs a fresh render."
    />
  );
}
