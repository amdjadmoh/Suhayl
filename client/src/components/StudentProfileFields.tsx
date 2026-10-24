import type { StudentProfileForm } from "@/lib/studentProfile";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field } from "@/components/kit";
import { CountryChips } from "@/components/CountryChips";
import { t } from "@/lib/i18n";

const ANY_DEGREE = "any";

export function StudentProfileFields({
  value,
  onChange,
  idPrefix,
}: {
  value: StudentProfileForm;
  onChange: (next: StudentProfileForm) => void;
  idPrefix: string;
}): React.ReactElement {
  const set = <K extends keyof StudentProfileForm>(key: K, v: StudentProfileForm[K]): void => onChange({ ...value, [key]: v });

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Field label={t("GPA")} htmlFor={`${idPrefix}-gpa`}>
        <Input id={`${idPrefix}-gpa`} type="number" inputMode="decimal" step="0.01" min="0" max="4" placeholder="3.2" value={value.gpa} onChange={(e) => set("gpa", e.target.value)} />
      </Field>
      <Field label={t("IELTS")} htmlFor={`${idPrefix}-ielts`}>
        <Input id={`${idPrefix}-ielts`} type="number" inputMode="decimal" step="0.5" min="0" max="9" placeholder="6.5" value={value.ieltsScore} onChange={(e) => set("ieltsScore", e.target.value)} />
      </Field>
      <Field label={t("€ a month")} htmlFor={`${idPrefix}-budget`}>
        <Input id={`${idPrefix}-budget`} type="number" inputMode="numeric" min="0" placeholder="900" value={value.monthlyBudget} onChange={(e) => set("monthlyBudget", e.target.value)} />
      </Field>
      <Field label={t("Degree")} className="sm:col-span-1">
        <Select value={value.degreeLevel || ANY_DEGREE} onValueChange={(v) => set("degreeLevel", v === ANY_DEGREE ? "" : v)}>
          <SelectTrigger aria-label={t("Degree")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_DEGREE}>{t("Not decided")}</SelectItem>
            <SelectItem value="Bachelor">{t("Bachelor")}</SelectItem>
            <SelectItem value="Master">{t("Master")}</SelectItem>
            <SelectItem value="PhD">{t("PhD")}</SelectItem>
            <SelectItem value="Diploma">{t("Diploma")}</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <Field label={t("Intake")} htmlFor={`${idPrefix}-intake`} className="sm:col-span-2">
        <Input id={`${idPrefix}-intake`} placeholder={t("September 2027")} value={value.targetIntake} onChange={(e) => set("targetIntake", e.target.value)} />
      </Field>
      <div className="sm:col-span-3">
        <p className="mb-2 text-[13px] font-semibold text-ink-2">{t("Countries")}</p>
        <CountryChips value={value.preferredCountries} onChange={(v) => set("preferredCountries", v)} />
      </div>
    </div>
  );
}
