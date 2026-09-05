import { BlogErrorState } from "../../components/BlogErrorState";

export default function BlogEntryNotFound() {
  return (
    <BlogErrorState
      description="Check the address, or browse the published field notes."
      title="No note at this address."
    />
  );
}
