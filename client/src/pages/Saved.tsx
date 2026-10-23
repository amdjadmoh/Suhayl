import { Link } from "react-router-dom";
import { useFavorites, useCountries, useUniversities, usePrograms, useRemoveFavorite } from "@/lib/api";
import type { Favorite } from "@/lib/api";
import { formatTuition, plural } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CountryPlate, EmptyState, LoadingRows, PageHeader, Section } from "@/components/kit";
import { SaveToggle } from "@/components/SaveToggle";

function SavedLine({
  to,
  title,
  meta,
  country,
  trailing,
  onRemove,
}: {
  to: string;
  title: string;
  meta?: React.ReactNode;
  country?: string;
  trailing?: React.ReactNode;
  onRemove: () => void;
}): React.ReactElement {
  return (
    <li className="flex items-center gap-4 py-3.5 px-5">
      <CountryPlate country={country} />
      <div className="min-w-0 flex-1">
        <Link to={to} className="font-medium text-ink hover:text-brand-ink">
          {title}
        </Link>
        {meta && <p className="mt-0.5 truncate text-[13px] text-ink-3">{meta}</p>}
      </div>
      {trailing}
      <SaveToggle saved onToggle={onRemove} />
    </li>
  );
}

export default function Saved(): React.ReactElement {
  const { data: favorites, isLoading: favsLoading } = useFavorites();
  const { data: countries } = useCountries();
  const { data: unisData } = useUniversities();
  const { data: progsData } = usePrograms();
  const removeFav = useRemoveFavorite();

  const remove = (f: Favorite): void => removeFav.mutate({ type: f.type, itemId: f.itemId });

  const header = (
    <PageHeader
      kicker={favorites?.length ? `Saved · ${plural(favorites.length, "item")}` : "Saved"}
      title="Saved for later"
    >
      Programs, universities and countries you bookmarked while browsing. Press the bookmark again to let one go.
    </PageHeader>
  );

  if (favsLoading) {
    return (
      <>
        {header}
        <LoadingRows rows={4} />
      </>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <>
        {header}
        <EmptyState
          title="Nothing saved yet"
          action={
            <Button variant="primary" asChild>
              <Link to="/programs">Browse programs</Link>
            </Button>
          }
        >
          Look for the bookmark next to a program, university or country. Whatever you mark ends up here.
        </EmptyState>
      </>
    );
  }

  const programFavorites = favorites.filter((f) => f.type === "program");
  const universityFavorites = favorites.filter((f) => f.type === "university");
  const countryFavorites = favorites.filter((f) => f.type === "country");

  return (
    <>
      {header}
      <div className="space-y-10">
        {programFavorites.length > 0 && (
          <Section title="Programs" count={programFavorites.length}>
            <ul className="card divide-y divide-rule-soft overflow-hidden">
              {programFavorites.map((fav) => {
                const prog = progsData?.programs?.find((p) => p._id === fav.itemId);
                const uni = prog && typeof prog.universityId === "object" ? prog.universityId : null;
                return (
                  <SavedLine
                    key={fav._id}
                    to={prog ? `/programs/${prog._id}` : "#"}
                    title={prog?.name ?? "A program that's no longer listed"}
                    country={uni?.country}
                    meta={uni ? `${uni.name}, ${uni.city}` : undefined}
                    trailing={
                      prog && (
                        <span className="hidden items-center gap-3 sm:flex">
                          <Badge variant="outline">{prog.degreeLevel}</Badge>
                          <span className="text-xs text-ink-2 tnum">
                            {formatTuition(prog.tuitionFee, prog.tuitionCurrency, prog.tuitionPeriod)}
                          </span>
                        </span>
                      )
                    }
                    onRemove={() => remove(fav)}
                  />
                );
              })}
            </ul>
          </Section>
        )}

        {universityFavorites.length > 0 && (
          <Section title="Universities" count={universityFavorites.length}>
            <ul className="card divide-y divide-rule-soft overflow-hidden">
              {universityFavorites.map((fav) => {
                const uni = unisData?.universities?.find((u) => u._id === fav.itemId);
                return (
                  <SavedLine
                    key={fav._id}
                    to={uni ? `/universities/${uni._id}` : "#"}
                    title={uni?.name ?? "A university that's no longer listed"}
                    country={uni?.country}
                    meta={uni ? `${uni.city}, ${uni.country}` : undefined}
                    trailing={
                      uni?.qsRank != null && <span className="text-xs text-ink-3 tnum">QS {uni.qsRank}</span>
                    }
                    onRemove={() => remove(fav)}
                  />
                );
              })}
            </ul>
          </Section>
        )}

        {countryFavorites.length > 0 && (
          <Section title="Countries" count={countryFavorites.length}>
            <ul className="card divide-y divide-rule-soft overflow-hidden">
              {countryFavorites.map((fav) => {
                const country = countries?.find((c) => c._id === fav.itemId);
                return (
                  <SavedLine
                    key={fav._id}
                    to={country ? `/countries/${country._id}` : "#"}
                    title={country?.name ?? "A country that's no longer listed"}
                    country={country?.name}
                    meta={country?.visaType}
                    onRemove={() => remove(fav)}
                  />
                );
              })}
            </ul>
          </Section>
        )}
      </div>
    </>
  );
}
