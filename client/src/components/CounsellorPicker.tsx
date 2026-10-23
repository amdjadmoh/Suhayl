import { toast } from "sonner";
import type { Student } from "@/types/student";
import { useTeam } from "@/lib/api-team";
import { useUpdateStudent } from "@/lib/api";
import { useAuth } from "@/lib/authContext";
import { getErrorMessage } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      toast.success(name ? `${student.name.split(" ")[0]} is now with ${name}` : "No counsellor now");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Couldn't change the counsellor"));
    }
  }

  return (
    <div className="mb-8">
      <p className="mb-3 text-[17px] font-bold tracking-[-0.01em]">Counsellor</p>
      <Select value={student.counsellorId ?? NOBODY} onValueChange={change} disabled={update.isPending}>
        <SelectTrigger aria-label="Counsellor" className="h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {members.map((m) => (
            <SelectItem key={m._id} value={m._id}>
              {m._id === user?._id ? `${m.name} (me)` : m.name}
            </SelectItem>
          ))}
          <SelectItem value={NOBODY}>Nobody yet</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
