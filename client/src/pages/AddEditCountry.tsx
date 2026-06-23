import { useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import type { Country } from "@/types/country"
import { useCreateCountry, useUpdateCountry, useCountry } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ArrowLeft, Save, AlertCircle, Loader2 } from "lucide-react"

type CountryFormData = Omit<Country, "_id" | "createdAt" | "updatedAt">

export default function AddEditCountry(): React.ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const { data: existing, isLoading } = useCountry(id ?? "")
  const createMutation = useCreateCountry()
  const updateMutation = useUpdateCountry()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CountryFormData>({
    defaultValues: {
      name: "",
      currency: "EUR",
      livingCostEstimate: 0,
      visaRequirements: "",
      visaAcceptanceRate: 80,
      visaBankAccountAmount: 0,
      visaBankAccountLocked: false,
      pros: [],
      cons: [],
      notes: "",
    },
  })

  useEffect(() => {
    if (existing && isEdit) {
      reset({
        name: existing.name,
        currency: existing.currency,
        livingCostEstimate: existing.livingCostEstimate,
        visaRequirements: existing.visaRequirements,
        visaAcceptanceRate: existing.visaAcceptanceRate,
        visaBankAccountAmount: existing.visaBankAccountAmount,
        visaBankAccountLocked: existing.visaBankAccountLocked,
        pros: existing.pros,
        cons: existing.cons,
        notes: existing.notes ?? "",
      })
    }
  }, [existing, isEdit, reset])

  async function onSubmit(data: CountryFormData): Promise<void> {
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data })
        toast.success("Country updated")
      } else {
        await createMutation.mutateAsync(data)
        toast.success("Country added")
      }
      navigate("/countries")
    } catch {
      toast.error(isEdit ? "Failed to update country" : "Failed to add country")
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
        <h2 className="text-lg font-semibold">Country not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/countries")}>
          Back to Countries
        </Button>
      </div>
    )
  }

  const visaBankAccountLocked = watch("visaBankAccountLocked")

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEdit ? "Edit Country" : "Add Country"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Country Name <span className="text-destructive">*</span></Label>
              <Input id="name" {...register("name", { required: "Name is required" })} placeholder="e.g. Germany" />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" {...register("currency")} placeholder="EUR" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="livingCostEstimate">Living Cost/Month</Label>
              <Input id="livingCostEstimate" type="number" {...register("livingCostEstimate", { setValueAs: (v) => Number(v) })} placeholder="900" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Visa Info</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="visaRequirements">Visa Requirements <span className="text-destructive">*</span></Label>
              <Textarea id="visaRequirements" {...register("visaRequirements", { required: "Required" })} rows={4} placeholder="Describe visa process..." />
              {errors.visaRequirements && <p className="text-sm text-destructive">{errors.visaRequirements.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="visaAcceptanceRate">Acceptance Rate (%)</Label>
              <Input id="visaAcceptanceRate" type="number" {...register("visaAcceptanceRate", { setValueAs: (v) => Number(v) })} placeholder="85" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visaBankAccountAmount">Bank Account Required</Label>
              <Input id="visaBankAccountAmount" type="number" {...register("visaBankAccountAmount", { setValueAs: (v) => Number(v) })} placeholder="11208" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visaBankAccountLocked">Blocked Account</Label>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox id="visaBankAccountLocked" checked={visaBankAccountLocked}
                  onCheckedChange={(checked) => setValue("visaBankAccountLocked", checked === true)} />
                <Label htmlFor="visaBankAccountLocked">{visaBankAccountLocked ? "Locked (Blocked Account)" : "Regular Account"}</Label>
              </div>
            </div>
          </CardContent>
        </Card>

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
                placeholder="Tuition-free at public universities&#10;Strong economy&#10;..."
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
                placeholder="Blocked account required&#10;Bureaucracy slow&#10;..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea id="notes" {...register("notes")} placeholder="Additional notes..." rows={3} />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/countries")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />{isEdit ? "Update" : "Save"} Country</>}
          </Button>
        </div>
      </form>
    </div>
  )
}
