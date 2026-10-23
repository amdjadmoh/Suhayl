import { useCountries } from "@/lib/api";
import { cn } from "@/lib/utils";

/** Tap-to-toggle list of every country in the catalogue. */
export function CountryChips({
  value,
  onChange,
  className,
}: {
  value: string[];
  onChange: (next: string[]) => void;
  className?: string;
}): React.ReactElement {
  const { data: countries } = useCountries();

  function toggle(name: string): void {
    onChange(value.includes(name) ? value.filter((c) => c !== name) : [...value, name]);
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {countries
        ?.slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((c) => {
          const on = value.includes(c.name);
          return (
            <button
              key={c._id}
              type="button"
              onClick={() => toggle(c.name)}
              aria-pressed={on}
              className={cn("rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                on ? "border-brand bg-brand text-on-brand" : "border-rule bg-paper-raised text-ink-2 hover:bg-paper-hover hover:text-ink",
              )}
            >
              {c.name}
            </button>
          );
        })}
    </div>
  );
}
