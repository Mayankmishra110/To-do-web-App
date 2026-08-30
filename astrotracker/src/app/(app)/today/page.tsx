import { PageHeader } from "@/components/page-header";
import { NotBuiltYet } from "@/components/not-built-yet";

export default function TodayPage() {
  return (
    <>
      <PageHeader title="Today" />
      <NotBuiltYet phase={4} what="Your primary focus, today's actions and habit check-off." />
    </>
  );
}
