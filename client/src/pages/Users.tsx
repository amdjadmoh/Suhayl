import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import { useUsers, useDeleteUser, useCreateUserByAdmin, useUpdateUserByAdmin } from "@/lib/api";
import type { User } from "@/types/auth";
import { useAuth } from "@/lib/authContext";
import { cn, getErrorMessage } from "@/lib/utils";
import { initials, plural } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ErrorState, Field, FilterTabs, LoadingRows, PageHeader } from "@/components/kit";

type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: string;
};

const ROLE_TONE: Record<string, string> = {
  admin: "bg-stamp-soft text-stamp",
  agency: "bg-sea-soft text-sea",
  student: "bg-paper-sunken text-ink-2",
};

type RoleFilter = "all" | "student" | "agency" | "admin";

export default function UsersPage(): React.ReactElement {
  const { data: users, isLoading, isError, error } = useUsers();
  const deleteMutation = useDeleteUser();
  const createMutation = useCreateUserByAdmin();
  const updateMutation = useUpdateUserByAdmin();
  const { user: currentUser } = useAuth();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const [role, setRole] = useState<RoleFilter>("all");
  const [query, setQuery] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    defaultValues: { name: "", email: "", password: "", role: "student" },
  });

  const counts = useMemo(() => {
    const c = { all: users?.length ?? 0, student: 0, agency: 0, admin: 0 };
    for (const u of users ?? []) c[u.role] += 1;
    return c;
  }, [users]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (users ?? [])
      .filter((u) => role === "all" || u.role === role)
      .filter((u) => !q || `${u.name} ${u.email}`.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, role, query]);

  function openCreateDialog(): void {
    setEditingUser(null);
    reset({ name: "", email: "", password: "", role: "student" });
    setDialogOpen(true);
  }

  function openEditDialog(user: User): void {
    setEditingUser(user);
    reset({ name: user.name, email: user.email, password: "", role: user.role });
    setDialogOpen(true);
  }

  async function onSubmit(data: UserFormData): Promise<void> {
    try {
      if (editingUser) {
        await updateMutation.mutateAsync({
          id: editingUser._id,
          data: { name: data.name, email: data.email, role: data.role },
        });
        toast.success("Account updated");
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        });
        toast.success("Account created");
      }
      setDialogOpen(false);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, editingUser ? "Failed to update user" : "Failed to create user"));
    }
  }

  async function handleDelete(): Promise<void> {
    if (!toDelete) return;
    try {
      await deleteMutation.mutateAsync(toDelete._id);
      toast.success("Account deleted");
      setToDelete(null);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete user"));
    }
  }

  if (isError) {
    return <ErrorState title="Accounts didn't load">{error instanceof Error ? error.message : "Unknown error"}</ErrorState>;
  }

  return (
    <>
      <PageHeader
        kicker={isLoading ? "People" : `People · ${plural(users?.length ?? 0, "account")}`}
        title="Accounts"
        actions={
          <Button variant="primary" onClick={openCreateDialog}>
            Create an account
          </Button>
        }
      >
        Everyone who can sign in. Open an account to see what they've added to the catalogue.
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <FilterTabs<RoleFilter>
          value={role}
          onChange={setRole}
          options={[
            { value: "all", label: "All", count: counts.all },
            { value: "student", label: "Students", count: counts.student },
            { value: "agency", label: "Agencies", count: counts.agency },
            { value: "admin", label: "Admins", count: counts.admin },
          ]}
        />
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-4" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name or email" className="pl-10" aria-label="Find an account" />
        </div>
      </div>

      {isLoading ? (
        <LoadingRows rows={6} />
      ) : (
        <ul className="card divide-y divide-rule-soft overflow-hidden">
          {visible.map((user) => {
            const isSelf = user._id === currentUser?._id;
            return (
              <li key={user._id} className="flex flex-wrap items-center gap-x-5 gap-y-2 py-3.5 px-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-ink tnum">
                  {initials(user.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <Link to={`/users/${user._id}`} className="font-semibold text-ink hover:text-brand-ink">
                    {user.name}
                  </Link>
                  {isSelf && <span className="ml-2 rounded-full bg-paper-sunken px-2 py-0.5 text-[11px] font-medium text-ink-3">you</span>}
                  <p className="truncate text-[13px] text-ink-3">{user.email}</p>
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize", ROLE_TONE[user.role])}>
                  {user.role}
                </span>
                <span className="flex">
                  <Button variant="ghost" size="xs" onClick={() => openEditDialog(user)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    className="text-stamp hover:bg-stamp-soft hover:text-stamp"
                    disabled={isSelf}
                    title={isSelf ? "You can't delete your own account" : undefined}
                    onClick={() => setToDelete(user)}
                  >
                    Delete
                  </Button>
                </span>
              </li>
            );
          })}
          {visible.length === 0 && (
            <li className="py-10 text-center text-sm text-ink-3">No accounts match.</li>
          )}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
            <DialogHeader>
              <DialogTitle>{editingUser ? `Edit ${editingUser.name}` : "Create an account"}</DialogTitle>
              {!editingUser && (
                <DialogDescription>Send them the password privately — or let them use “Forgot password” to set their own.</DialogDescription>
              )}
            </DialogHeader>
            <div className="grid gap-4">
              <Field label="Name" htmlFor="u-name" required error={errors.name?.message}>
                <Input id="u-name" {...register("name", { required: "Name is required" })} placeholder="Full name" />
              </Field>
              <Field label="Email" htmlFor="u-email" required error={errors.email?.message}>
                <Input id="u-email" type="email" {...register("email", { required: "Email is required" })} placeholder="name@example.com" />
              </Field>
              {!editingUser && (
                <Field label="Password" htmlFor="u-password" required error={errors.password?.message}>
                  <Input
                    id="u-password"
                    type="password"
                    autoComplete="new-password"
                    {...register("password", { required: !editingUser ? "Password is required" : false })}
                  />
                </Field>
              )}
              <Field label="Role" required>
                <Select value={watch("role")} onValueChange={(v: string) => setValue("role", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" {...register("role")} />
              </Field>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="animate-spin" />}
                {editingUser ? "Save" : "Create account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {toDelete?.name}'s account?</DialogTitle>
            <DialogDescription>They won't be able to sign in again. This can't be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setToDelete(null)}>
              Keep
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="animate-spin" />}
              Delete account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
