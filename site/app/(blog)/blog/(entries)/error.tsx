"use client";

import { BlogErrorState } from "../../components/BlogErrorState";

export default function BlogEntryError({ reset }: { reset: () => void }) {
  return (
    <BlogErrorState
      description="The field note hit an unexpected edge case. The rest of the system is still online."
      reset={reset}
      title="This note needs a fresh render."
    />
  );
}
