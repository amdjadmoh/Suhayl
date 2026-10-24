import { toast } from "sonner";
import type { Student } from "@/types/student";
import { useTeam } from "@/lib/api-team";
import { useUpdateStudent } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { getErrorMessage } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { t } from "@/lib/i18n";

const NOBODY = "none";

/** Who at the agency looks after this student. Hidden for agencies of one. */
export function CounsellorPicker({ student }: { student: Student }): React.ReactElement | null {
  const { user } = useAuth();
  const { data: team } = useTeam();
  const update = useUpdateStudent();
  const members = team?.members ?? [];
  if (members.length < 2) return null;

  async function change(value: string): Promise<void> {
    const counsellorId = value === NOBODY ? null : value;
    try {
      await update.mutateAsync({ id: student._id, data: { counsellorId } });
      const name = members.find((m) => m._id === counsellorId)?.name;
      toast.success(name ? t("{name} is now with {counsellor}", { name: student.name.split(" ")[0] ?? student.name, counsellor: name }) : t("No counsellor now"));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t("Couldn't change the counsellor")));
    }
  }

  return (
    <div className="mb-8">
      <p className="mb-3 text-[17px] font-bold tracking-[-0.01em]">{t("Counsellor")}</p>
      <Select value={student.counsellorId ?? NOBODY} onValueChange={change} disabled={update.isPending}>
        <SelectTrigger aria-label={t("Counsellor")} className="h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {members.map((m) => (
            <SelectItem key={m._id} value={m._id}>
              {m._id === user?._id ? t("{name} (me)", { name: m.name }) : m.name}
            </SelectItem>
          ))}
          <SelectItem value={NOBODY}>{t("Nobody yet")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
