import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ArrowLeft, Save, AlertCircle, Loader2 } from "lucide-react"

export default function AddEditCity(): React.ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const { data: existing, isLoading } = useCity(id ?? "")
  const { data: countries } = useCountries()
  const createMutation = useCreateCity()
  const updateMutation = useUpdateCity()

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
      country: "",
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
    }
  }, [existing, isEdit, reset])

  async function onSubmit(data: CityFormData): Promise<void> {
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data })
        toast.success("City updated")
      } else {
        await createMutation.mutateAsync(data)
        toast.success("City added")
      }
      navigate("/cities")
    } catch {
      toast.error(isEdit ? "Failed to update city" : "Failed to add city")
    }
  }

  if (isEdit && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card><CardContent className="p-6"><Skeleton className="h-96 w-full" /></CardContent></Card>
      </div>
    )
  }

  if (isEdit && !existing) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
        <h2 className="text-lg font-semibold">City not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/cities")}>
          Back to Cities
        </Button>
      </div>
    )
  }

  const isCapital = watch("isCapital")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEdit ? "Edit City" : "Add City"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">City Name <span className="text-destructive">*</span></Label>
              <Input id="name" {...register("name", { required: "Name is required" })} placeholder="e.g. Berlin" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country <span className="text-destructive">*</span></Label>
              <Select
                value={watch("country")}
                onValueChange={(v: string) => setValue("country", v)}
              >
                <SelectTrigger>
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
              {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="population">Population</Label>
              <Input id="population" type="number" {...register("population", { setValueAs: (v) => v === "" || v === undefined ? undefined : Number(v) })} placeholder="e.g. 3600000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isCapital">Capital City</Label>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox id="isCapital" checked={isCapital}
                  onCheckedChange={(checked) => setValue("isCapital", checked === true)} />
                <Label htmlFor="isCapital">{isCapital ? "Yes" : "No"}</Label>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language <span className="text-destructive">*</span></Label>
              <Input id="language" {...register("language", { required: "Language is required" })} placeholder="e.g. German" />
              {errors.language && <p className="text-sm text-destructive">{errors.language.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="climate">Climate <span className="text-destructive">*</span></Label>
              <Input id="climate" {...register("climate", { required: "Climate is required" })} placeholder="e.g. Temperate oceanic" />
              {errors.climate && <p className="text-sm text-destructive">{errors.climate.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Cost of Living */}
        <Card>
          <CardHeader><CardTitle>Cost of Living</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="averageRentSingle">Avg Rent (Single) <span className="text-destructive">*</span></Label>
              <Input id="averageRentSingle" type="number" {...register("averageRentSingle", { required: "Required", setValueAs: (v) => Number(v) })} placeholder="1200" />
              {errors.averageRentSingle && <p className="text-sm text-destructive">{errors.averageRentSingle.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="averageRentShared">Avg Rent (Shared) <span className="text-destructive">*</span></Label>
              <Input id="averageRentShared" type="number" {...register("averageRentShared", { required: "Required", setValueAs: (v) => Number(v) })} placeholder="800" />
              {errors.averageRentShared && <p className="text-sm text-destructive">{errors.averageRentShared.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyLivingCost">Monthly Living Cost <span className="text-destructive">*</span></Label>
              <Input id="monthlyLivingCost" type="number" {...register("monthlyLivingCost", { required: "Required", setValueAs: (v) => Number(v) })} placeholder="1000" />
              {errors.monthlyLivingCost && <p className="text-sm text-destructive">{errors.monthlyLivingCost.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="internetSpeed">Internet Speed (Mbps)</Label>
              <Input id="internetSpeed" type="number" {...register("internetSpeed", { setValueAs: (v) => v === "" || v === undefined ? undefined : Number(v) })} placeholder="50" />
            </div>
          </CardContent>
        </Card>

        {/* Scores */}
        <Card>
          <CardHeader><CardTitle>Scores (1-10)</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="qualityOfLifeScore">Quality of Life <span className="text-destructive">*</span></Label>
              <Input id="qualityOfLifeScore" type="number" min={1} max={10} {...register("qualityOfLifeScore", { required: "Required", setValueAs: (v) => Number(v) })} placeholder="5" />
              {errors.qualityOfLifeScore && <p className="text-sm text-destructive">{errors.qualityOfLifeScore.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="safetyScore">Safety <span className="text-destructive">*</span></Label>
              <Input id="safetyScore" type="number" min={1} max={10} {...register("safetyScore", { required: "Required", setValueAs: (v) => Number(v) })} placeholder="5" />
              {errors.safetyScore && <p className="text-sm text-destructive">{errors.safetyScore.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="publicTransportScore">Public Transport <span className="text-destructive">*</span></Label>
              <Input id="publicTransportScore" type="number" min={1} max={10} {...register("publicTransportScore", { required: "Required", setValueAs: (v) => Number(v) })} placeholder="5" />
              {errors.publicTransportScore && <p className="text-sm text-destructive">{errors.publicTransportScore.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentFriendliness">Student Friendliness <span className="text-destructive">*</span></Label>
              <Input id="studentFriendliness" type="number" min={1} max={10} {...register("studentFriendliness", { required: "Required", setValueAs: (v) => Number(v) })} placeholder="5" />
              {errors.studentFriendliness && <p className="text-sm text-destructive">{errors.studentFriendliness.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="englishFriendliness">English Friendliness <span className="text-destructive">*</span></Label>
              <Input id="englishFriendliness" type="number" min={1} max={10} {...register("englishFriendliness", { required: "Required", setValueAs: (v) => Number(v) })} placeholder="5" />
              {errors.englishFriendliness && <p className="text-sm text-destructive">{errors.englishFriendliness.message}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Pros & Cons */}
        <Card>
          <CardHeader><CardTitle>Pros & Cons</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pros">Pros (one per line)</Label>
              <Textarea id="pros" rows={5}
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
              <Label htmlFor="cons">Cons (one per line)</Label>
              <Textarea id="cons" rows={5}
                {...register("cons", {
                  setValueAs: (v: string | string[]) =>
                    Array.isArray(v) ? v : v ? v.split("\n").filter(Boolean) : [],
                })}
                value={(watch("cons") ?? []).join("\n")}
                onChange={(e) => setValue("cons", e.target.value.split("\n").filter(Boolean))}
                placeholder="High rent in central areas&#10;Cold winters&#10;..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea id="notes" {...register("notes")} placeholder="Additional notes..." rows={3} />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/cities")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />{isEdit ? "Update" : "Save"} City</>}
          </Button>
        </div>
      </form>
    </div>
  )
}
