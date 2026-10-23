import { useParams, Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useUsers,
  useUniversities,
  usePrograms,
  useApplications,
  useToggleUniversityOfficial,
  useToggleProgramOfficial,
} from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { BackLink, ErrorState, LoadingPage, LoadingRows, PageHeader, Section } from "@/components/kit";
import { ApplicationList } from "@/components/ledger";

export default function UserDetail(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const { data: users, isLoading: usersLoading } = useUsers();
  const user = users?.find((u) => u._id === id);

  const { data: unisData, isLoading: unisLoading } = useUniversities();
  const { data: progsData, isLoading: progsLoading } = usePrograms();
  const { data: appsData, isLoading: appsLoading } = useApplications();

  const userUnis = unisData?.universities.filter((u) => u.createdBy === id && !u.isOfficial) ?? [];
  const userProgs = progsData?.programs.filter((p) => p.createdBy === id && !p.isOfficial) ?? [];
  const userApps = appsData?.applications.filter((a) => a.createdBy === id || a.studentEmail === user?.email) ?? [];

  const toggleUniOfficial = useToggleUniversityOfficial();
  const toggleProgOfficial = useToggleProgramOfficial();

  if (!isAdmin) {
    return <ErrorState title="Admins only">You don't have permission to see this page.</ErrorState>;
  }

  if (usersLoading) return <LoadingPage />;

  if (!user) {
    return (
      <ErrorState title="Account not found" action={<Button variant="outline" onClick={() => navigate("/users")}>All accounts</Button>}>
        It may have been deleted, or the link is wrong.
      </ErrorState>
    );
  }

  async function promoteUni(uniId: string, isOfficial?: boolean): Promise<void> {
    try {
      await toggleUniOfficial.mutateAsync(uniId);
      toast.success(isOfficial ? "University marked as custom" : "University is now official");
    } catch {
      toast.error("Failed to toggle official status");
    }
  }

  async function promoteProg(progId: string, isOfficial?: boolean): Promise<void> {
    try {
      await toggleProgOfficial.mutateAsync(progId);
      toast.success(isOfficial ? "Program marked as custom" : "Program is now official");
    } catch {
      toast.error("Failed to toggle official status");
    }
  }

  return (
    <>
      <PageHeader
        back={<BackLink to="/users">Accounts</BackLink>}
        kicker={`${user.role.charAt(0).toUpperCase()}${user.role.slice(1)} account`}
        title={user.name}
      >
        <a href={`mailto:${user.email}`} className="link-ink">
          {user.email}
        </a>
      </PageHeader>

      <div className="space-y-10">
        <Section title="Universities they added" count={unisLoading ? undefined : userUnis.length}>
          {unisLoading ? (
            <LoadingRows rows={2} className="border-y-0" />
          ) : userUnis.length === 0 ? (
            <p className="card-soft px-5 py-5 text-sm text-ink-3">None.</p>
          ) : (
            <ul className="card divide-y divide-rule-soft overflow-hidden">
              {userUnis.map((u) => (
                <li key={u._id} className="flex flex-wrap items-center justify-between gap-3 py-3 px-5">
                  <Link to={`/universities/${u._id}`} className="font-medium text-ink hover:text-brand-ink">
                    {u.name}
                    <span className="font-normal text-ink-3"> — {u.city}, {u.country}</span>
                  </Link>
                  <Button size="sm" variant="outline" disabled={toggleUniOfficial.isPending} onClick={() => promoteUni(u._id, u.isOfficial)}>
                    {u.isOfficial ? "Make custom" : "Make official"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Programs they added" count={progsLoading ? undefined : userProgs.length}>
          {progsLoading ? (
            <LoadingRows rows={2} className="border-y-0" />
          ) : userProgs.length === 0 ? (
            <p className="card-soft px-5 py-5 text-sm text-ink-3">None.</p>
          ) : (
            <ul className="card divide-y divide-rule-soft overflow-hidden">
              {userProgs.map((p) => (
                <li key={p._id} className="flex flex-wrap items-center justify-between gap-3 py-3 px-5">
                  <Link to={`/programs/${p._id}`} className="font-medium text-ink hover:text-brand-ink">
                    {p.name}
                    <span className="font-normal text-ink-3"> — {p.degreeLevel}</span>
                  </Link>
                  <Button size="sm" variant="outline" disabled={toggleProgOfficial.isPending} onClick={() => promoteProg(p._id, p.isOfficial)}>
                    {p.isOfficial ? "Make custom" : "Make official"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Applications" count={appsLoading ? undefined : userApps.length}>
          {appsLoading ? (
            <LoadingRows rows={2} className="border-y-0" />
          ) : userApps.length === 0 ? (
            <p className="card-soft px-5 py-5 text-sm text-ink-3">None.</p>
          ) : (
            <ApplicationList applications={userApps} />
          )}
        </Section>
      </div>
    </>
  );
}
