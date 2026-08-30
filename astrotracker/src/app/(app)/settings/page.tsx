import { requireUser } from "@/lib/auth/guard";
import { db } from "@/lib/db";
import { logout } from "@/server/actions/auth";
import { PageHeader } from "@/components/page-header";
import { Panel } from "@/components/ui/panel";
import { Button } from "@/components/ui/button";
import { IdentityForm } from "./identity-form";
import { PreferencesForm } from "./preferences-form";

export default async function SettingsPage() {
  const user = await requireUser();
  const identity = await db.identity.findFirst({
    where: { userId: user.id, isActive: true },
    orderBy: { createdAt: "desc" },
    include: { revisions: { orderBy: { replacedAt: "desc" }, take: 10 } },
  });

  const timezones =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : [user.timezone];

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your north star, your account, and the timezone every day boundary is measured in."
      />

      <div className="space-y-5">
        <Panel
          title="North star"
          subtitle="Who are you trying to become? Edit it whenever it stops being true — previous wordings are kept."
        >
          <IdentityForm
            statement={identity?.statement ?? ""}
            description={identity?.description ?? ""}
          />
          {identity && identity.revisions.length > 0 && (
            <div className="mt-6 border-t border-line-soft pt-4">
              <p className="label-caps">Previous wordings</p>
              <ul className="mt-3 space-y-3">
                {identity.revisions.map((revision) => (
                  <li key={revision.id} className="text-xs text-ink-faint">
                    <span className="font-mono">
                      {revision.replacedAt.toISOString().slice(0, 10)}
                    </span>
                    <p className="mt-1 text-ink-muted">{revision.statement}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Panel>

        <Panel title="Account">
          <PreferencesForm
            email={user.email}
            name={user.name ?? ""}
            timezone={user.timezone}
            timezones={timezones}
          />
        </Panel>

        <Panel title="Session">
          <form action={logout}>
            <Button type="submit" variant="danger">
              Sign out
            </Button>
          </form>
        </Panel>
      </div>
    </>
  );
}
