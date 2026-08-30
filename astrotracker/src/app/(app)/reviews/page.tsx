import { PageHeader } from "@/components/page-header";
import { NotBuiltYet } from "@/components/not-built-yet";

export default function ReviewsPage() {
  return (
    <>
      <PageHeader title="Reviews" />
      <NotBuiltYet phase={7} what="Weekly, biweekly, monthly and 90-day reviews built from recorded data." />
    </>
  );
}
