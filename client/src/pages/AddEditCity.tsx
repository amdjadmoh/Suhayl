import { useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import type { CityFormData } from "@/types/city"
import {
  useCreateCity,
  useUpdateCity,
  useCity,
  useCountries,
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ArrowLeft, Save, AlertCircle, Loader2 } from "lucide-react"
import { getErrorMessage } from "@/lib/utils"

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
        const country = countries.find(
          (c) => c.name.toLowerCase() === targetCountryName.toLowerCase()
        )
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

  if (isEdit && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="rounded-xl border border-slate-100 bg-white p-6"><Skeleton className="h-96 w-full" /></div>
      </div>
    )
  }

  if (isEdit && !existing) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">City not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>
    )
  }

  const isCapital = watch("isCapital")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          {isEdit ? "Edit City" : "Add City"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Basic Info</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">City Name <span className="text-red-500">*</span></Label>
              <Input id="name" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("name", { required: "Name is required" })} placeholder="e.g. Berlin" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium text-slate-700">Country <span className="text-red-500">*</span></Label>
              <Select
                value={watch("country")}
                onValueChange={(v: string) => setValue("country", v)}
              >
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select a country..." />
                </SelectTrigger>
                <SelectContent>
                  {countries?.map((c) => (
                    <SelectItem key={c._id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="population" className="text-sm font-medium text-slate-700">Population</Label>
              <Input id="population" type="number" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("population", { setValueAs: (v) => v === "" || v === undefined ? undefined : Number(v) })} placeholder="e.g. 3600000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isCapital" className="text-sm font-medium text-slate-700">Capital City</Label>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox id="isCapital" checked={isCapital}
                  onCheckedChange={(checked) => setValue("isCapital", checked === true)} />
                <Label htmlFor="isCapital" className="text-sm font-medium text-slate-700">{isCapital ? "Yes" : "No"}</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-medium text-slate-700">Language <span className="text-red-500">*</span></Label>
              <Input id="language" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("language", { required: "Language is required" })} placeholder="e.g. German" />
              {errors.language && <p className="text-sm text-red-500">{errors.language.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="climate" className="text-sm font-medium text-slate-700">Climate <span className="text-red-500">*</span></Label>
              <Input id="climate" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("climate", { required: "Climate is required" })} placeholder="e.g. Temperate oceanic" />
              {errors.climate && <p className="text-sm text-red-500">{errors.climate.message}</p>}
            </div>
          </div>
        </div>

        {/* Cost of Living */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Cost of Living</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="averageRentSingle" className="text-sm font-medium text-slate-700">Avg Rent (Single) <span className="text-red-500">*</span></Label>
              <Input id="averageRentSingle" type="number" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("averageRentSingle", { required: "Required", setValueAs: (v) => Number(v) })} placeholder="1200" />
              {errors.averageRentSingle && <p className="text-sm text-red-500">{errors.averageRentSingle.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="averageRentShared" className="text-sm font-medium text-slate-700">Avg Rent (Shared) <span className="text-red-500">*</span></Label>
              <Input id="averageRentShared" type="number" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("averageRentShared", { required: "Required", setValueAs: (v) => Number(v) })} placeholder="800" />
              {errors.averageRentShared && <p className="text-sm text-red-500">{errors.averageRentShared.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyLivingCost" className="text-sm font-medium text-slate-700">Monthly Living Cost <span className="text-red-500">*</span></Label>
              <Input id="monthlyLivingCost" type="number" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("monthlyLivingCost", { required: "Required", setValueAs: (v) => Number(v) })} placeholder="1000" />
              {errors.monthlyLivingCost && <p className="text-sm text-red-500">{errors.monthlyLivingCost.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="internetSpeed" className="text-sm font-medium text-slate-700">Internet Speed (Mbps)</Label>
              <Input id="internetSpeed" type="number" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("internetSpeed", { setValueAs: (v) => v === "" || v === undefined ? undefined : Number(v) })} placeholder="50" />
            </div>
          </div>
        </div>

        {/* Scores */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Scores (1-10)</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="qualityOfLifeScore" className="text-sm font-medium text-slate-700">Quality of Life <span className="text-red-500">*</span></Label>
              <Input id="qualityOfLifeScore" type="number" min={1} max={10} className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("qualityOfLifeScore", { required: "Required", setValueAs: (v) => Number(v) })} placeholder="5" />
              {errors.qualityOfLifeScore && <p className="text-sm text-red-500">{errors.qualityOfLifeScore.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="safetyScore" className="text-sm font-medium text-slate-700">Safety <span className="text-red-500">*</span></Label>
              <Input id="safetyScore" type="number" min={1} max={10} className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("safetyScore", { required: "Required", setValueAs: (v) => Number(v) })} placeholder="5" />
              {errors.safetyScore && <p className="text-sm text-red-500">{errors.safetyScore.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="publicTransportScore" className="text-sm font-medium text-slate-700">Public Transport <span className="text-red-500">*</span></Label>
              <Input id="publicTransportScore" type="number" min={1} max={10} className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("publicTransportScore", { required: "Required", setValueAs: (v) => Number(v) })} placeholder="5" />
              {errors.publicTransportScore && <p className="text-sm text-red-500">{errors.publicTransportScore.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentFriendliness" className="text-sm font-medium text-slate-700">Student Friendliness <span className="text-red-500">*</span></Label>
              <Input id="studentFriendliness" type="number" min={1} max={10} className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("studentFriendliness", { required: "Required", setValueAs: (v) => Number(v) })} placeholder="5" />
              {errors.studentFriendliness && <p className="text-sm text-red-500">{errors.studentFriendliness.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="englishFriendliness" className="text-sm font-medium text-slate-700">English Friendliness <span className="text-red-500">*</span></Label>
              <Input id="englishFriendliness" type="number" min={1} max={10} className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("englishFriendliness", { required: "Required", setValueAs: (v) => Number(v) })} placeholder="5" />
              {errors.englishFriendliness && <p className="text-sm text-red-500">{errors.englishFriendliness.message}</p>}
            </div>
          </div>
        </div>

        {/* Pros & Cons */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Pros & Cons</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pros" className="text-sm font-medium text-slate-700">Pros (one per line)</Label>
              <Textarea id="pros" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" rows={5}
                {...register("pros", {
                  setValueAs: (v: string | string[]) =>
                    Array.isArray(v) ? v : v ? v.split("\n").filter(Boolean) : [],
                })}
                value={(watch("pros") ?? []).join("\n")}
                onChange={(e) => setValue("pros", e.target.value.split("\n").filter(Boolean))}
                placeholder="Affordable cost of living&#10;Good public transport&#10;..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cons" className="text-sm font-medium text-slate-700">Cons (one per line)</Label>
              <Textarea id="cons" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" rows={5}
                {...register("cons", {
                  setValueAs: (v: string | string[]) =>
                    Array.isArray(v) ? v : v ? v.split("\n").filter(Boolean) : [],
                })}
                value={(watch("cons") ?? []).join("\n")}
                onChange={(e) => setValue("cons", e.target.value.split("\n").filter(Boolean))}
                placeholder="High rent in central areas&#10;Cold winters&#10;..."
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Notes</h3>
          </div>
          <div className="p-6">
            <Textarea id="notes" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("notes")} placeholder="Additional notes..." rows={3} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" className="border-slate-200 hover:bg-slate-50 rounded-xl" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />{isEdit ? "Update" : "Save"} City</>}
          </Button>
        </div>
      </form>
    </div>
  )
}
