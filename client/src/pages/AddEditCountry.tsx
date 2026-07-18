import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import type { Country } from "@/types/country"
import { useCreateCountry, useUpdateCountry, useCountry } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { ArrowLeft, Save, AlertCircle, Loader2, X } from "lucide-react"
import { getErrorMessage } from "@/lib/utils"

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
      visaBankAccountAmount: 0,
      visaBankAccountLocked: false,
      visaType: "",
      proofOfFundsMonthly: 0,
      whereToApply: "",
      processingTime: "",
      workPermit: "",
      postGraduationVisa: "",
      additionalVisaNotes: "",
      pros: [],
      cons: [],
      requiredDocuments: [],
      verificationStatus: "ai" as const,
      notes: "",
    },
  })

  const visaBankAccountLocked = watch("visaBankAccountLocked")
  const [visaDocInput, setVisaDocInput] = useState("")
  const requiredDocuments = watch("requiredDocuments") ?? []

  useEffect(() => {
    if (existing && isEdit) {
      reset({
        name: existing.name,
        currency: existing.currency,
        livingCostEstimate: existing.livingCostEstimate,
        visaBankAccountAmount: existing.visaBankAccountAmount,
        visaBankAccountLocked: existing.visaBankAccountLocked,
        visaType: existing.visaType ?? "",
        proofOfFundsMonthly: existing.proofOfFundsMonthly ?? 0,
        whereToApply: existing.whereToApply ?? "",
        processingTime: existing.processingTime ?? "",
        workPermit: existing.workPermit ?? "",
        postGraduationVisa: existing.postGraduationVisa ?? "",
        additionalVisaNotes: existing.additionalVisaNotes ?? "",
        pros: existing.pros,
        cons: existing.cons,
        requiredDocuments: existing.requiredDocuments ?? [],
        verificationStatus: existing.verificationStatus ?? "ai",
        notes: existing.notes ?? "",
      })
    }
  }, [existing, isEdit, reset])

  function addVisaDocument(): void {
    const trimmed = visaDocInput.trim();
    if (trimmed && !requiredDocuments.includes(trimmed)) {
      setValue("requiredDocuments", [...requiredDocuments, trimmed]);
      setVisaDocInput("");
    }
  }

  function removeVisaDocument(index: number): void {
    setValue("requiredDocuments", requiredDocuments.filter((_, i) => i !== index));
  }

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
    } catch (err: unknown) {
      toast.error(isEdit ? getErrorMessage(err, "Failed to update country") : getErrorMessage(err, "Failed to add country"))
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
        <h2 className="text-lg font-semibold">Country not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/countries")}>
          Back to Countries
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
          {isEdit ? "Edit Country" : "Add Country"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Basic Info</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name" className="text-sm font-medium text-slate-700">Country Name <span className="text-red-500">*</span></Label>
              <Input id="name" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("name", { required: "Name is required" })} placeholder="e.g. Germany" />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium text-slate-700">Currency</Label>
              <Input id="currency" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("currency")} placeholder="EUR" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="livingCostEstimate" className="text-sm font-medium text-slate-700">Living Cost/Month</Label>
              <Input id="livingCostEstimate" type="number" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("livingCostEstimate", { setValueAs: (v) => Number(v) })} placeholder="900" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Visa Info</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="visaBankAccountAmount" className="text-sm font-medium text-slate-700">Bank Account Required</Label>
              <Input id="visaBankAccountAmount" type="number" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("visaBankAccountAmount", { setValueAs: (v) => Number(v) })} placeholder="11208" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visaBankAccountLocked" className="text-sm font-medium text-slate-700">Blocked Account</Label>
              <div className="flex items-center gap-2 pt-1">
                <Checkbox id="visaBankAccountLocked" checked={visaBankAccountLocked}
                  onCheckedChange={(checked) => setValue("visaBankAccountLocked", checked === true)} />
                <Label htmlFor="visaBankAccountLocked" className="text-sm font-medium text-slate-700">{visaBankAccountLocked ? "Locked (Blocked Account)" : "Regular Account"}</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Visa Details</h3>
          </div>
          <div className="p-6 grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="visaType" className="text-sm font-medium text-slate-700">Visa Type</Label>
              <Input id="visaType" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("visaType")} placeholder="e.g. National Visa D (student visa)" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="proofOfFundsMonthly" className="text-sm font-medium text-slate-700">Proof of Funds/Month (€)</Label>
              <Input id="proofOfFundsMonthly" type="number" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("proofOfFundsMonthly", { setValueAs: (v) => Number(v) })} placeholder="e.g. 934" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="whereToApply" className="text-sm font-medium text-slate-700">Where to Apply</Label>
              <Input id="whereToApply" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("whereToApply")} placeholder="e.g. Apply at German embassy" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="processingTime" className="text-sm font-medium text-slate-700">Processing Time</Label>
              <Input id="processingTime" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("processingTime")} placeholder="e.g. 4–8 weeks" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="workPermit" className="text-sm font-medium text-slate-700">Work Permit</Label>
              <Input id="workPermit" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("workPermit")} placeholder="e.g. 20 hours/week" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="postGraduationVisa" className="text-sm font-medium text-slate-700">Post-Graduation Visa</Label>
              <Input id="postGraduationVisa" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("postGraduationVisa")} placeholder="e.g. 18-month job seeker visa" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm font-medium text-slate-700">Required Visa Documents</Label>
              <div className="flex gap-2">
                <Input value={visaDocInput} onChange={(e) => setVisaDocInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addVisaDocument(); } }}
                  className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20"
                  placeholder="Add a document..." />
                <Button type="button" variant="outline" className="border-slate-200 hover:bg-slate-50 rounded-xl" onClick={addVisaDocument}>Add</Button>
              </div>
              {requiredDocuments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {requiredDocuments.map((doc, i) => (
                    <span key={i} className="bg-slate-100 text-slate-700 rounded-full px-3 py-1 text-sm inline-flex items-center gap-1">
                      {doc}
                      <button type="button" onClick={() => removeVisaDocument(i)} className="ml-1 rounded-full hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-sm font-medium text-slate-700">Info Reliability</Label>
              <Select value={watch("verificationStatus") ?? "ai"} onValueChange={(v) => setValue("verificationStatus", v)}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">✓ Manually Verified</SelectItem>
                  <SelectItem value="ai">⚠ AI Verified — Recommend double-checking</SelectItem>
                  <SelectItem value="none">⚠ Not Verified — Use at your own risk</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-400">Controls how reliability warnings appear in the application checklist</p>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="additionalVisaNotes" className="text-sm font-medium text-slate-700">Additional Visa Notes</Label>
              <Textarea id="additionalVisaNotes" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("additionalVisaNotes")} rows={3} placeholder="e.g. Health insurance required, TB test, etc." />
            </div>
          </div>
        </div>

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
                placeholder="Tuition-free at public universities&#10;Strong economy&#10;..."
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
                placeholder="Blocked account required&#10;Bureaucracy slow&#10;..."
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h3 className="text-base font-semibold text-[#0F172A]">Notes</h3>
          </div>
          <div className="p-6">
            <Textarea id="notes" className="rounded-lg border-slate-200 focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20" {...register("notes")} placeholder="Additional notes..." rows={3} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button type="button" variant="outline" className="border-slate-200 hover:bg-slate-50 rounded-xl" onClick={() => navigate("/countries")}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-xl">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />{isEdit ? "Update" : "Save"} Country</>}
          </Button>
        </div>
      </form>
    </div>
  )
}
