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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, Save, AlertCircle, Loader2 } from "lucide-react";

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
    } catch {
      toast.error(isEdit ? "Failed to update university" : "Failed to create university");
    }
  }

  if (isEdit && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">{isEdit ? "Edit University" : "Add University"}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>University Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">University Name <span className="text-destructive">*</span></Label>
              <Input id="name" {...register("name", { required: "Name is required" })} placeholder="e.g. University of Oxford" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country <span className="text-destructive">*</span></Label>
              <Select value={watch("country")} onValueChange={(v) => setValue("country", v)}>
                <SelectTrigger><SelectValue placeholder="Select country..." /></SelectTrigger>
                <SelectContent>
                  {countries?.map((c) => (
                    <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
              <Input id="city" {...register("city", { required: "City is required" })} placeholder="e.g. Oxford" />
              {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ranking">World Ranking</Label>
              <Input id="ranking" type="number" {...register("ranking", { setValueAs: (v) => v === "" ? undefined : Number(v) })} placeholder="e.g. 5" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input id="websiteUrl" {...register("websiteUrl")} placeholder="https://..." />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" {...register("notes")} placeholder="Any notes about this institution..." rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/universities")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
              : <><Save className="mr-2 h-4 w-4" /> {isEdit ? "Update" : "Save"} University</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
