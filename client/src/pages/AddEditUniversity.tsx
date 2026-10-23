import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { UniversityFormData } from "@/types/university";
import { useCreateUniversity, useUpdateUniversity, useUniversity, useCountries } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BackLink, ErrorState, Field, FormSection, LoadingPage, PageHeader } from "@/components/kit";

export default function AddEditUniversity(): React.ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

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
      qsRank: null,
      theRank: null,
      arwuRank: null,
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
        qsRank: existing.qsRank ?? null,
        theRank: existing.theRank ?? null,
        arwuRank: existing.arwuRank ?? null,
        websiteUrl: existing.websiteUrl ?? "",
        notes: existing.notes ?? "",
      });
    }
  }, [existing, isEdit, reset]);

  async function onSubmit(data: UniversityFormData): Promise<void> {
    if (!data.country) {
      toast.error("Choose a country");
      return;
    }
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success("University updated");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("University added");
      }
      navigate("/universities");
    } catch (err: unknown) {
      toast.error(isEdit ? getErrorMessage(err, "Failed to update university") : getErrorMessage(err, "Failed to create university"));
    }
  }

  if (isEdit && isLoading) return <LoadingPage />;

  if (isEdit && !existing) {
    return (
      <ErrorState
        title="University not found"
        action={<Button variant="outline" onClick={() => navigate("/universities")}>All universities</Button>}
      />
    );
  }

  const rankField = (name: "qsRank" | "theRank" | "arwuRank") =>
    register(name, { setValueAs: (v) => (v === "" || v === null ? null : Number(v)) });

  return (
    <>
      <PageHeader
        back={<BackLink onClick={() => navigate(-1)}>Back</BackLink>}
        kicker={isEdit ? "Edit university" : isAdmin ? "New official university" : "New university"}
        title={isEdit ? existing?.name ?? "Edit university" : "Add a university"}
      >
        {!isEdit && !isAdmin
          ? "A university you add is visible only to you until an admin reviews it."
          : "Rankings are optional — leave a box empty if it isn't ranked there."}
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Where it is">
          <Field label="University name" htmlFor="name" required error={errors.name?.message} className="sm:col-span-2">
            <Input id="name" {...register("name", { required: "Name is required" })} placeholder="University of Oxford" />
          </Field>
          <Field label="Country" required error={errors.country?.message}>
            <Select value={watch("country")} onValueChange={(v) => setValue("country", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a country" />
              </SelectTrigger>
              <SelectContent>
                {countries?.map((c) => (
                  <SelectItem key={c._id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="City" htmlFor="city" required error={errors.city?.message}>
            <Input id="city" {...register("city", { required: "City is required" })} placeholder="Oxford" />
          </Field>
          <Field label="Website" htmlFor="websiteUrl" className="sm:col-span-2">
            <Input id="websiteUrl" {...register("websiteUrl")} placeholder="https://…" />
          </Field>
        </FormSection>

        <FormSection title="Rankings" description="The latest published position in each table.">
          <Field label="QS World" htmlFor="qsRank">
            <Input id="qsRank" type="number" className="tnum" {...rankField("qsRank")} placeholder="10" />
          </Field>
          <Field label="Times Higher Education" htmlFor="theRank">
            <Input id="theRank" type="number" className="tnum" {...rankField("theRank")} placeholder="15" />
          </Field>
          <Field label="ARWU / Shanghai" htmlFor="arwuRank">
            <Input id="arwuRank" type="number" className="tnum" {...rankField("arwuRank")} placeholder="20" />
          </Field>
          <Field label="Other ranking" htmlFor="ranking" hint="Any single number you go by.">
            <Input
              id="ranking"
              type="number"
              className="tnum"
              {...register("ranking", { setValueAs: (v) => (v === "" ? undefined : Number(v)) })}
              placeholder="5"
            />
          </Field>
        </FormSection>

        <FormSection title="Notes">
          <Field label="Notes" htmlFor="notes" className="sm:col-span-2">
            <Textarea id="notes" {...register("notes")} placeholder="What it's known for, campus, anything worth remembering" rows={4} />
          </Field>
        </FormSection>

        <div className="flex items-center justify-end gap-2 pt-6">
          <Button type="button" variant="ghost" onClick={() => navigate("/universities")}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isEdit ? "Save changes" : "Add university"}
          </Button>
        </div>
      </form>
    </>
  );
}
