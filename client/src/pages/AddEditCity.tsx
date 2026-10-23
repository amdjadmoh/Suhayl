import { useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { CityFormData } from "@/types/city"
import { useCreateCity, useUpdateCity, useCity, useCountries } from "@/lib/api"
import { getErrorMessage } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BackLink, ErrorState, Field, FormSection, LoadingPage, PageHeader } from "@/components/kit"

const SCORES: { name: keyof CityFormData; label: string }[] = [
  { name: "qualityOfLifeScore", label: "Quality of life" },
  { name: "safetyScore", label: "Safety" },
  { name: "publicTransportScore", label: "Public transport" },
  { name: "studentFriendliness", label: "Student life" },
  { name: "englishFriendliness", label: "English spoken" },
]

export default function AddEditCity(): React.ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEdit = Boolean(id)

  const { data: existing, isLoading } = useCity(id ?? "")
  const { data: countries } = useCountries()
  const createMutation = useCreateCity()
  const updateMutation = useUpdateCity()

  // If navigating from a country page, pre-select that country
  const preselectedCountry = searchParams.get("countryName") ?? ""

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CityFormData>({
    defaultValues: {
      name: "",
      country: preselectedCountry || "",
      population: undefined,
      isCapital: false,
      averageRentSingle: 0,
      averageRentShared: 0,
      monthlyLivingCost: 0,
      qualityOfLifeScore: 5,
      safetyScore: 5,
      publicTransportScore: 5,
      studentFriendliness: 5,
      internetSpeed: undefined,
      language: "",
      englishFriendliness: 5,
      climate: "",
      pros: [],
      cons: [],
      notes: "",
    },
  })

  useEffect(() => {
    if (existing && isEdit) {
      reset({
        name: existing.name,
        country: existing.country,
        population: existing.population,
        isCapital: existing.isCapital,
        averageRentSingle: existing.averageRentSingle,
        averageRentShared: existing.averageRentShared,
        monthlyLivingCost: existing.monthlyLivingCost,
        qualityOfLifeScore: existing.qualityOfLifeScore,
        safetyScore: existing.safetyScore,
        publicTransportScore: existing.publicTransportScore,
        studentFriendliness: existing.studentFriendliness,
        internetSpeed: existing.internetSpeed,
        language: existing.language,
        englishFriendliness: existing.englishFriendliness,
        climate: existing.climate,
        pros: existing.pros,
        cons: existing.cons,
        notes: existing.notes ?? "",
      })
    } else if (preselectedCountry && !isEdit) {
      setValue("country", preselectedCountry)
    }
  }, [existing, isEdit, reset, preselectedCountry, setValue])

  async function onSubmit(data: CityFormData): Promise<void> {
    if (!data.country) {
      toast.error("Choose a country")
      return
    }
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data })
        toast.success("City updated")
      } else {
        await createMutation.mutateAsync(data)
        toast.success("City added")
      }
      // Navigate back to country detail if we came from one, otherwise back
      const targetCountryName = data.country || preselectedCountry
      if (targetCountryName && countries?.length) {
        const country = countries.find((c) => c.name.toLowerCase() === targetCountryName.toLowerCase())
        if (country) {
          navigate(`/countries/${country._id}`)
          return
        }
      }
      navigate(-1)
    } catch (err: unknown) {
      toast.error(isEdit ? getErrorMessage(err, "Failed to update city") : getErrorMessage(err, "Failed to add city"))
    }
  }

  if (isEdit && isLoading) return <LoadingPage />

  if (isEdit && !existing) {
    return <ErrorState title="City not found" action={<Button variant="outline" onClick={() => navigate(-1)}>Go back</Button>} />
  }

  const isCapital = watch("isCapital")
  const num = (v: unknown): number => Number(v)
  const optionalNum = (v: unknown): number | undefined => (v === "" || v === undefined ? undefined : Number(v))

  const listField = (name: "pros" | "cons") => ({
    ...register(name, {
      setValueAs: (v: string | string[]) => (Array.isArray(v) ? v : v ? v.split("\n").filter(Boolean) : []),
    }),
    value: (watch(name) ?? []).join("\n"),
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(name, e.target.value.split("\n").filter(Boolean)),
  })

  return (
    <>
      <PageHeader
        back={<BackLink onClick={() => navigate(-1)}>Back</BackLink>}
        kicker={isEdit ? "Edit city" : "New city"}
        title={isEdit ? existing?.name ?? "Edit city" : "Add a city"}
      >
        Costs are per month, in the country's currency. Scores run from 1 (poor) to 10 (excellent).
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="The place">
          <Field label="City name" htmlFor="name" required error={errors.name?.message}>
            <Input id="name" {...register("name", { required: "Name is required" })} placeholder="Berlin" />
          </Field>
          <Field label="Country" required error={errors.country?.message}>
            <Select value={watch("country")} onValueChange={(v: string) => setValue("country", v)}>
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
          <Field label="Language" htmlFor="language" required error={errors.language?.message}>
            <Input id="language" {...register("language", { required: "Language is required" })} placeholder="German" />
          </Field>
          <Field label="Climate" htmlFor="climate" required error={errors.climate?.message}>
            <Input id="climate" {...register("climate", { required: "Climate is required" })} placeholder="Temperate, cold winters" />
          </Field>
          <Field label="Population" htmlFor="population">
            <Input id="population" type="number" className="tnum" {...register("population", { setValueAs: optionalNum })} placeholder="3600000" />
          </Field>
          <label className="flex cursor-pointer items-center gap-2.5 self-end pb-2 text-sm text-ink">
            <Checkbox id="isCapital" checked={isCapital} onCheckedChange={(checked) => setValue("isCapital", checked === true)} />
            It's the capital
          </label>
        </FormSection>

        <FormSection title="Costs" description="What a student actually pays each month.">
          <Field label="Everything, per month" htmlFor="monthlyLivingCost" required error={errors.monthlyLivingCost?.message}>
            <Input id="monthlyLivingCost" type="number" className="tnum" {...register("monthlyLivingCost", { required: "Required", setValueAs: num })} placeholder="1000" />
          </Field>
          <Field label="Room in a shared flat" htmlFor="averageRentShared" required error={errors.averageRentShared?.message}>
            <Input id="averageRentShared" type="number" className="tnum" {...register("averageRentShared", { required: "Required", setValueAs: num })} placeholder="550" />
          </Field>
          <Field label="Flat on your own" htmlFor="averageRentSingle" required error={errors.averageRentSingle?.message}>
            <Input id="averageRentSingle" type="number" className="tnum" {...register("averageRentSingle", { required: "Required", setValueAs: num })} placeholder="1100" />
          </Field>
          <Field label="Internet (Mbps)" htmlFor="internetSpeed">
            <Input id="internetSpeed" type="number" className="tnum" {...register("internetSpeed", { setValueAs: optionalNum })} placeholder="50" />
          </Field>
        </FormSection>

        <FormSection title="Scores" description="Out of ten. Be honest — students compare cities on these.">
          {SCORES.map((s) => (
            <Field key={s.name} label={s.label} htmlFor={s.name} required error={errors[s.name]?.message as string | undefined}>
              <Input
                id={s.name}
                type="number"
                min={1}
                max={10}
                className="tnum"
                {...register(s.name, { required: "Required", setValueAs: num })}
                placeholder="5"
              />
            </Field>
          ))}
        </FormSection>

        <FormSection title="Good and less good" description="One point per line.">
          <Field label="Good" htmlFor="pros">
            <Textarea id="pros" rows={5} {...listField("pros")} placeholder={"Cheap public transport\nLots of students"} />
          </Field>
          <Field label="Less good" htmlFor="cons">
            <Textarea id="cons" rows={5} {...listField("cons")} placeholder={"Hard to find a room\nGrey winters"} />
          </Field>
        </FormSection>

        <FormSection title="Notes">
          <Field label="Notes" htmlFor="notes" className="sm:col-span-2">
            <Textarea id="notes" {...register("notes")} placeholder="Neighbourhoods, tips, anything else" rows={3} />
          </Field>
        </FormSection>

        <div className="flex items-center justify-end gap-2 pt-6">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isEdit ? "Save changes" : "Add city"}
          </Button>
        </div>
      </form>
    </>
  )
}
