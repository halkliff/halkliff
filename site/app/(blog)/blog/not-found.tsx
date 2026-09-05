import { BlogErrorState } from "../components/BlogErrorState";

export default function BlogNotFound() {
  return (
    <BlogErrorState
      description="That field note has not been committed yet."
      title="No note at this address."
    />
  );
}
