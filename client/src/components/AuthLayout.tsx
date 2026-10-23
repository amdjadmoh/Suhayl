import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Wordmark } from "@/components/kit";
import { NightSky } from "@/components/NightSky";

const POINTS = ["Every deadline in one list", "A checklist for each application", "Visa rules for each country"];

/**
 * Auth pages: the form on the left, a rounded night-sky card on the right
 * (hidden on small screens).
 */
export default function AuthLayout({
  kicker,
  title,
  subtitle,
  children,
  footer,
}: {
  kicker?: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="flex min-h-screen bg-paper p-3">
      <div className="flex w-full flex-col px-4 py-4 sm:px-8 lg:w-1/2 lg:px-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-[15px]" aria-label="Suhayl — home">
            <Wordmark />
          </Link>
          <Link to="/" className="rounded-full px-3 py-1.5 text-sm font-medium text-ink-3 hover:bg-paper-sunken hover:text-ink">
            Back to home
          </Link>
        </div>

        <div className="flex flex-1 items-center py-10">
          <div className="mx-auto w-full max-w-[24rem] animate-settle">
            {kicker && <p className="kicker mb-1">{kicker}</p>}
            <h1 className="text-[32px] leading-[1.1] font-bold tracking-[-0.03em]">{title}</h1>
            <p className="mt-2.5 text-[15px] leading-relaxed text-ink-3">{subtitle}</p>
            <div className="mt-8">{children}</div>
            {footer && <div className="mt-8 text-center text-sm text-ink-3">{footer}</div>}
          </div>
        </div>
      </div>

      <div className="relative hidden flex-1 overflow-hidden rounded-[2rem] bg-night lg:block">
        <NightSky className="absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
          <ul className="mb-8 space-y-2.5">
            {POINTS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-[15px] font-semibold text-night-ink">
                <span className="flex size-6 items-center justify-center rounded-full bg-white/15">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <p className="max-w-md text-[15px] leading-relaxed text-night-ink-2">
            <span lang="ar" className="font-bold text-starlight">
              سهيل
            </span>{" "}
            · Suhayl is Canopus, the bright star desert travellers watched for to keep their bearings.
          </p>
        </div>
      </div>
    </div>
  );
}
