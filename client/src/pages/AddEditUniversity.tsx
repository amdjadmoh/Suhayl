import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import type { UniversityFormData } from "@/types/university";
import {
  useCreateUniversity,
  useUpdateUniversity,
  useUniversity,
  useCountries,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
;
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Save, AlertCircle, Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

export default function AddEditUniversity(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { data: existing, isLoading } = useUniversity(id ?? "");
  const { data: countries } = useCountries();
  const createMutation = useCreateUniversity();
  const updateMutation = useUpdateUniversity();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UniversityFormData>({
    defaultValues: {
      name: "",
      country: "",
      city: "",
      ranking: undefined,
      websiteUrl: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (existing && isEdit) {
      reset({
        name: existing.name,
        country: existing.country,
        city: existing.city,
        ranking: existing.ranking,
        websiteUrl: existing.websiteUrl ?? "",
        notes: existing.notes ?? "",
      });
    }
  }, [existing, isEdit, reset]);

  async function onSubmit(data: UniversityFormData): Promise<void> {
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success("University updated");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("University created");
      }
      navigate("/universities");
    } catch (err: unknown) {
      toast.error(isEdit ? getErrorMessage(err, "Failed to update university") : getErrorMessage(err, "Failed to create university"));
    }
  }

  if (isEdit && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="rounded-xl border border-slate-100 bg-white p-6"><Skeleton className="h-64 w-full" /></div>
      </div>
    );
  }

  if (isEdit && !existing) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">University not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/universities")}>Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">{isEdit ? "Edit University" : "Add University"}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">University Information</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">University Name <span className="text-red-500">*</span></Label>
              <Input id="name" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("name", { required: "Name is required" })} placeholder="e.g. University of Oxford" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium text-slate-700">Country <span className="text-red-500">*</span></Label>
              <Select value={watch("country")} onValueChange={(v) => setValue("country", v)}>
                <SelectTrigger className="rounded-lg"><SelectValue placeholder="Select country..." /></SelectTrigger>
                <SelectContent>
                  {countries?.map((c) => (
                    <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-sm font-medium text-slate-700">City <span className="text-red-500">*</span></Label>
              <Input id="city" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("city", { required: "City is required" })} placeholder="e.g. Oxford" />
              {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ranking" className="text-sm font-medium text-slate-700">World Ranking</Label>
              <Input id="ranking" type="number" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("ranking", { setValueAs: (v) => v === "" ? undefined : Number(v) })} placeholder="e.g. 5" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl" className="text-sm font-medium text-slate-700">Website URL</Label>
              <Input id="websiteUrl" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("websiteUrl")} placeholder="https://..." />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes" className="text-sm font-medium text-slate-700">Notes</Label>
              <Textarea id="notes" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("notes")} placeholder="Any notes about this institution..." rows={3} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" className="border-slate-200 hover:bg-slate-50 rounded-xl" onClick={() => navigate("/universities")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              : <><Save className="mr-2 h-4 w-4" /> {isEdit ? "Update" : "Save"} University</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
