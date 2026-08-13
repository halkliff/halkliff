import { BlogErrorState } from "../../components/BlogErrorState";

export default function BlogEntryNotFound() {
  return (
    <BlogErrorState
      description="That entry has not been committed to the field notes yet."
      title="No note at this address."
    />
  );
}
