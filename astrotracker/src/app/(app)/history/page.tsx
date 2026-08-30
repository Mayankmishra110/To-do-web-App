import { PageHeader } from "@/components/page-header";
import { NotBuiltYet } from "@/components/not-built-yet";

export default function HistoryPage() {
  return (
    <>
      <PageHeader title="History" />
      <NotBuiltYet phase={8} what="Any previous day, exactly as it was recorded." />
    </>
  );
}
