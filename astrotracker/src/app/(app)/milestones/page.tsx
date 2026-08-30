import { PageHeader } from "@/components/page-header";
import { NotBuiltYet } from "@/components/not-built-yet";

export default function MilestonesPage() {
  return (
    <>
      <PageHeader title="Milestones" />
      <NotBuiltYet phase={3} what="Generated and hand-written milestones, reorderable and editable." />
    </>
  );
}
