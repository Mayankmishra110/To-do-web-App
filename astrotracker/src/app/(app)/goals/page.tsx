import { PageHeader } from "@/components/page-header";
import { NotBuiltYet } from "@/components/not-built-yet";

export default function GoalsPage() {
  return (
    <>
      <PageHeader title="Goals" />
      <NotBuiltYet phase={2} what="Long-term goals, why they matter, and their 90-day cycles." />
    </>
  );
}
