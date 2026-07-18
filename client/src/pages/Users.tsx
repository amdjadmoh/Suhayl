import { useState } from "react";
import { Link } from "react-router-dom";
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
   Mail,
   Shield,
   Building2,
   GraduationCap,
 } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

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
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, editingUser ? "Failed to update user" : "Failed to create user"));
    }
  }

  async function handleDelete(userId: string, userName: string): Promise<void> {
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`))
      return;
    try {
      await deleteMutation.mutateAsync(userId);
      toast.success("User deleted");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to delete user"));
    }
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="text-lg font-semibold text-[#0F172A]">Failed to load users</h2>
        <p className="text-sm text-slate-500">
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Shield className="h-4 w-4" />;
      case "agency": return <Building2 className="h-4 w-4" />;
      default: return <GraduationCap className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-50 text-red-700 border-red-200";
      case "agency": return "bg-blue-50 text-blue-700 border-blue-200";
      default: return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-600 via-pink-600 to-red-700 p-8 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-rose-400 blur-3xl" />
        </div>
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="mt-2 text-rose-100">Manage all registered users</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog} className="bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm rounded-xl">
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editingUser ? "Edit User" : "Add User"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="u-name" className="text-sm font-medium text-[#0F172A]">
                    Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="u-name"
                    {...register("name", { required: "Name is required" })}
                    placeholder="John Doe"
                    className="rounded-xl border-slate-200"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="u-email" className="text-sm font-medium text-[#0F172A]">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="u-email"
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    placeholder="john@example.com"
                    className="rounded-xl border-slate-200"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {!editingUser && (
                  <div className="space-y-2">
                    <Label htmlFor="u-password" className="text-sm font-medium text-[#0F172A]">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="u-password"
                      type="password"
                      {...register("password", {
                        required: !editingUser ? "Password is required" : false,
                      })}
                      placeholder="Enter password"
                      className="rounded-xl border-slate-200"
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="u-role" className="text-sm font-medium text-[#0F172A]">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch("role")}
                    onValueChange={(v: string) => setValue("role", v)}
                  >
                    <SelectTrigger className="rounded-xl border-slate-200">
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
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl shadow-lg shadow-rose-500/20">
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
      </div>

      {/* Users List */}
      <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </div>
        ) : users && users.length > 0 ? (
          <>
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-[#0F172A]">
                {users.length} user{users.length !== 1 ? "s" : ""}
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between px-6 py-5 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex-shrink-0">
                      <span className="text-lg font-bold text-[#0F172A]">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link to={`/users/${user._id}`} className="font-semibold text-[#0F172A] truncate hover:text-[#0EA5E9] transition-colors">
                        {user.name}
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="h-3.5 w-3.5" />
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`${getRoleColor(user.role)} border rounded-full px-3 py-1`}
                    >
                      <span className="flex items-center gap-1.5">
                        {getRoleIcon(user.role)}
                        {user.role}
                      </span>
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 hover:bg-slate-100 rounded-lg"
                      onClick={() => openEditDialog(user)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg"
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
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 mb-4">
              <UsersIcon className="h-10 w-10 text-rose-500" />
            </div>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-2">No users found</h2>
          </div>
        )}
      </div>
    </div>
  );
}
