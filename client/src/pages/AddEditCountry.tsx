import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import type { Country } from "@/types/country"
import { useCreateCountry, useUpdateCountry, useCountry } from "@/lib/api"
import { getErrorMessage } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BackLink, ErrorState, Field, FormSection, LoadingPage, PageHeader, Token } from "@/components/kit"

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
    const trimmed = visaDocInput.trim()
    if (trimmed && !requiredDocuments.includes(trimmed)) {
      setValue("requiredDocuments", [...requiredDocuments, trimmed])
      setVisaDocInput("")
    }
  }

  function removeVisaDocument(index: number): void {
    setValue("requiredDocuments", requiredDocuments.filter((_, i) => i !== index))
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

  if (isEdit && isLoading) return <LoadingPage />

  if (isEdit && !existing) {
    return (
      <ErrorState
        title="Country not found"
        action={<Button variant="outline" onClick={() => navigate("/countries")}>All countries</Button>}
      />
    )
  }

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
        kicker={isEdit ? "Edit country" : "New country"}
        title={isEdit ? existing?.name ?? "Edit country" : "Add a country"}
      >
        Students read this before they apply for a visa, so be specific: amounts, durations, where to go.
      </PageHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <FormSection title="Basics">
          <Field label="Country name" htmlFor="name" required error={errors.name?.message} className="sm:col-span-2">
            <Input id="name" {...register("name", { required: "Name is required" })} placeholder="Germany" />
          </Field>
          <Field label="Currency" htmlFor="currency">
            <Input id="currency" className="tnum" {...register("currency")} placeholder="EUR" />
          </Field>
          <Field label="Living cost, per month" htmlFor="livingCostEstimate">
            <Input id="livingCostEstimate" type="number" className="tnum" {...register("livingCostEstimate", { setValueAs: (v) => Number(v) })} placeholder="900" />
          </Field>
        </FormSection>

        <FormSection title="Money for the visa" description="How much a student must prove they have, and whether it's locked away.">
          <Field label="Amount to show, per year" htmlFor="visaBankAccountAmount">
            <Input id="visaBankAccountAmount" type="number" className="tnum" {...register("visaBankAccountAmount", { setValueAs: (v) => Number(v) })} placeholder="11208" />
          </Field>
          <Field label="Proof of funds, per month" htmlFor="proofOfFundsMonthly">
            <Input id="proofOfFundsMonthly" type="number" className="tnum" {...register("proofOfFundsMonthly", { setValueAs: (v) => Number(v) })} placeholder="934" />
          </Field>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink sm:col-span-2">
            <Checkbox checked={visaBankAccountLocked} onCheckedChange={(checked) => setValue("visaBankAccountLocked", checked === true)} />
            It has to sit in a blocked account
          </label>
        </FormSection>

        <FormSection title="The visa itself">
          <Field label="Visa type" htmlFor="visaType" className="sm:col-span-2">
            <Input id="visaType" {...register("visaType")} placeholder="National visa D (student)" />
          </Field>
          <Field label="Where to apply" htmlFor="whereToApply" className="sm:col-span-2">
            <Input id="whereToApply" {...register("whereToApply")} placeholder="German embassy or consulate in your country" />
          </Field>
          <Field label="Processing time" htmlFor="processingTime">
            <Input id="processingTime" {...register("processingTime")} placeholder="4–8 weeks" />
          </Field>
          <Field label="Work allowed" htmlFor="workPermit">
            <Input id="workPermit" {...register("workPermit")} placeholder="20 hours a week" />
          </Field>
          <Field label="After graduating" htmlFor="postGraduationVisa" className="sm:col-span-2">
            <Input id="postGraduationVisa" {...register("postGraduationVisa")} placeholder="18-month job-seeker permit" />
          </Field>
          <Field label="Documents the embassy asks for" className="sm:col-span-2" hint="Press Enter to add each one.">
            <div className="flex gap-2">
              <Input
                value={visaDocInput}
                onChange={(e) => setVisaDocInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addVisaDocument()
                  }
                }}
                placeholder="Passport, admission letter, health insurance…"
              />
              <Button type="button" variant="outline" onClick={addVisaDocument}>
                Add
              </Button>
            </div>
            {requiredDocuments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {requiredDocuments.map((doc, i) => (
                  <Token key={i} onRemove={() => removeVisaDocument(i)}>
                    {doc}
                  </Token>
                ))}
              </div>
            )}
          </Field>
          <Field label="Anything else" htmlFor="additionalVisaNotes" className="sm:col-span-2">
            <Textarea id="additionalVisaNotes" {...register("additionalVisaNotes")} rows={3} placeholder="Health insurance from day one, TB test for some nationalities…" />
          </Field>
        </FormSection>

        <FormSection title="How much to trust it" description="This decides the reliability note students see next to the visa checklist.">
          <Field label="Source" className="sm:col-span-2">
            <Select value={watch("verificationStatus") ?? "ai"} onValueChange={(v) => setValue("verificationStatus", v as CountryFormData["verificationStatus"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual">Checked by hand</SelectItem>
                <SelectItem value="ai">Compiled with AI — worth double-checking</SelectItem>
                <SelectItem value="none">Not verified</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </FormSection>

        <FormSection title="Good and less good" description="One point per line.">
          <Field label="Good" htmlFor="pros">
            <Textarea id="pros" rows={5} {...listField("pros")} placeholder={"No tuition at public universities\nStrong job market"} />
          </Field>
          <Field label="Less good" htmlFor="cons">
            <Textarea id="cons" rows={5} {...listField("cons")} placeholder={"Blocked account required\nSlow paperwork"} />
          </Field>
        </FormSection>

        <FormSection title="Notes">
          <Field label="Notes" htmlFor="notes" className="sm:col-span-2">
            <Textarea id="notes" {...register("notes")} placeholder="Anything else" rows={3} />
          </Field>
        </FormSection>

        <div className="flex items-center justify-end gap-2 pt-6">
          <Button type="button" variant="ghost" onClick={() => navigate("/countries")}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="animate-spin" />}
            {isEdit ? "Save changes" : "Add country"}
          </Button>
        </div>
      </form>
    </>
  )
}
