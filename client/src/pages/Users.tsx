import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useUsers,
  useDeleteUser,
  useCreateUserByAdmin,
  useUpdateUserByAdmin,
} from "@/lib/api";
import type { User } from "@/types/auth";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Users as UsersIcon,
  Trash2,
  Pencil,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";

type UserFormData = {
  name: string;
  email: string;
  password: string;
  role: string;
};

export default function UsersPage(): React.ReactElement {
  const { data: users, isLoading, isError, error } = useUsers();
  const deleteMutation = useDeleteUser();
  const createMutation = useCreateUserByAdmin();
  const updateMutation = useUpdateUserByAdmin();
  const { user: currentUser } = useAuth();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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

  function openCreateDialog(): void {
    setEditingUser(null);
    reset({ name: "", email: "", password: "", role: "student" });
    setDialogOpen(true);
  }

  function openEditDialog(user: User): void {
    setEditingUser(user);
    reset({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setDialogOpen(true);
  }

  async function onSubmit(data: UserFormData): Promise<void> {
    try {
      if (editingUser) {
        await updateMutation.mutateAsync({
          id: editingUser._id,
          data: {
            name: data.name,
            email: data.email,
            role: data.role,
          },
        });
        toast.success("User updated");
      } else {
        await createMutation.mutateAsync({
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
        });
        toast.success("User created");
      }
      setDialogOpen(false);
    } catch {
      toast.error(
        editingUser ? "Failed to update user" : "Failed to create user",
      );
    }
  }

  async function handleDelete(userId: string, userName: string): Promise<void> {
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`))
      return;
    try {
      await deleteMutation.mutateAsync(userId);
      toast.success("User deleted");
    } catch {
      toast.error("Failed to delete user");
    }
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">Failed to load users</h2>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage all registered users
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Add User"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="u-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="u-name"
                  {...register("name", { required: "Name is required" })}
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="u-email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="u-email"
                  type="email"
                  {...register("email", { required: "Email is required" })}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="u-password">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="u-password"
                    type="password"
                    {...register("password", {
                      required: !editingUser ? "Password is required" : false,
                    })}
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="u-role">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch("role")}
                  onValueChange={(v: string) => setValue("role", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" {...register("role")} />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingUser ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        {isLoading ? (
          <CardContent className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        ) : users && users.length > 0 ? (
          <>
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">
                {users.length} user{users.length !== 1 ? "s" : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between px-6 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={
                          user.role === "admin"
                            ? "bg-red-100 text-red-700"
                            : user.role === "agency"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                        }
                      >
                        {user.role}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(user)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        disabled={
                          user._id === currentUser?._id ||
                          deleteMutation.isPending
                        }
                        onClick={() => handleDelete(user._id, user.name)}
                        title={
                          user._id === currentUser?._id
                            ? "Cannot delete yourself"
                            : "Delete user"
                        }
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UsersIcon className="mb-4 h-16 w-16 text-muted-foreground/30" />
            <h2 className="text-lg font-semibold">No users found</h2>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
