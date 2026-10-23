import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Check, Clock, Download, FileUp, Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { portalFileUrl, usePortal, useUploadToPortal } from "@/lib/api-documents";
import type { PortalApplication, PortalData } from "@/types/document";
import { cn, getErrorMessage } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CountryPlate, Wordmark } from "@/components/kit";

type Lang = "fr" | "en";

// Families read this page, so it speaks French first
const T = {
  fr: {
    fileOf: (n: string) => `Le dossier de ${n}`,
    followedBy: (a: string) => `Suivi par ${a}`,
    todo: "À envoyer",
    todoNone: "Rien à envoyer pour le moment.",
    sent: "Déjà envoyés",
    applications: "Candidatures",
    noApplications: "Votre agence n'a pas encore ajouté de candidature.",
    upload: "Envoyer le fichier",
    replace: "Remplacer",
    uploading: "Envoi…",
    neededBy: (d: string) => `À envoyer avant le ${d}`,
    sentBack: "À renvoyer",
    waiting: "En cours de vérification",
    accepted: "Accepté",
    requested: "Demandé",
    fileHint: "PDF ou photo, 10 Mo maximum.",
    uploaded: (name: string) => `${name} envoyé. Votre agence va le vérifier.`,
    deadline: "Date limite",
    submitted: "Envoyée le",
    documents: "Documents",
    interview: "Entretien",
    visa: "Visa",
    visaApproved: "Accordé",
    visaRefused: "Refusé",
    visaPending: "Demande en cours",
    contact: "Une question ? Écrivez à votre agence :",
    privacy: "Ce lien est privé. Ne le partagez qu'avec votre famille.",
    gone: "Ce lien ne fonctionne plus",
    goneText: "Il a peut-être été remplacé. Demandez à votre agence de vous envoyer le nouveau lien.",
    lastUpdate: "Mis à jour le",
    status: {
      Preparing: "En préparation",
      Applied: "Candidature envoyée",
      Accepted: "Accepté",
      Rejected: "Refusé",
      Waitlisted: "Liste d'attente",
      Enrolled: "Inscrit",
    },
    steps: ["Préparation", "Envoyée", "Réponse", "Visa", "Inscrit"],
  },
  en: {
    fileOf: (n: string) => `${n}'s file`,
    followedBy: (a: string) => `Looked after by ${a}`,
    todo: "To send",
    todoNone: "Nothing to send right now.",
    sent: "Already sent",
    applications: "Applications",
    noApplications: "Your agency hasn't added an application yet.",
    upload: "Send the file",
    replace: "Replace",
    uploading: "Sending…",
    neededBy: (d: string) => `Needed by ${d}`,
    sentBack: "Please send again",
    waiting: "Being checked",
    accepted: "Accepted",
    requested: "Requested",
    fileHint: "A PDF or a photo, up to 10 MB.",
    uploaded: (name: string) => `${name} sent. Your agency will check it.`,
    deadline: "Deadline",
    submitted: "Sent on",
    documents: "Documents",
    interview: "Interview",
    visa: "Visa",
    visaApproved: "Granted",
    visaRefused: "Refused",
    visaPending: "Applied",
    contact: "A question? Write to your agency:",
    privacy: "This link is private. Only share it with your family.",
    gone: "This link doesn't work any more",
    goneText: "It may have been replaced. Ask your agency to send you the new link.",
    lastUpdate: "Updated",
    status: {
      Preparing: "Preparing",
      Applied: "Applied",
      Accepted: "Accepted",
      Rejected: "Rejected",
      Waitlisted: "Waitlisted",
      Enrolled: "Enrolled",
    },
    steps: ["Preparing", "Sent", "Answer", "Visa", "Enrolled"],
  },
} as const;

type Strings = (typeof T)[Lang];

const STATUS_TONE: Record<PortalApplication["status"], string> = {
  Preparing: "bg-paper-sunken text-ink-2",
  Applied: "bg-sea-soft text-sea",
  Accepted: "bg-moss-soft text-moss",
  Rejected: "bg-stamp-soft text-stamp",
  Waitlisted: "bg-ochre-soft text-ochre",
  Enrolled: "bg-moss-solid text-white",
};

function readLang(): Lang {
  try {
    return localStorage.getItem("suhayl-portal-lang") === "en" ? "en" : "fr";
  } catch {
    return "fr";
  }
}

function dateIn(lang: Lang, iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** How far along the application is, on a five-step line the family can read at a glance. */
function stepOf(a: PortalApplication): number {
  if (a.status === "Enrolled") return 4;
  if (a.visaApplied || a.visaApproved != null) return 3;
  if (a.status === "Accepted" || a.status === "Rejected" || a.status === "Waitlisted") return 2;
  if (a.status === "Applied" || a.submittedAt) return 1;
  return 0;
}

function ApplicationCard({ a, t, lang }: { a: PortalApplication; t: Strings; lang: Lang }): React.ReactElement {
  const step = stepOf(a);
  const refused = a.status === "Rejected";
  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[16px] leading-snug font-bold text-ink">{a.program}</p>
          {a.university && (
            <p className="mt-1 flex items-center gap-2 text-[13px] text-ink-3">
              {a.country && <CountryPlate country={a.country} className="h-6 min-w-6 rounded-md text-[10px]" />}
              <span className="truncate">
                {a.university}
                {a.city ? `, ${a.city}` : ""}
              </span>
            </p>
          )}
        </div>
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_TONE[a.status])}>{t.status[a.status]}</span>
      </div>

      {!refused && (
        <ol className="mt-4 grid grid-cols-5 gap-1.5" aria-label={t.status[a.status]}>
          {t.steps.map((label, i) => (
            <li key={label} className="min-w-0">
              <span className={cn("block h-1.5 rounded-full", i <= step ? "bg-brand" : "bg-paper-sunken")} />
              <span className={cn("mt-1.5 block text-[10.5px] leading-tight break-words hyphens-auto sm:text-[11px]", i === step ? "font-semibold text-ink" : "text-ink-4")}>{label}</span>
            </li>
          ))}
        </ol>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[13px] sm:grid-cols-3">
        {a.submittedAt ? (
          <div>
            <dt className="text-ink-3">{t.submitted}</dt>
            <dd className="font-semibold text-ink">{dateIn(lang, a.submittedAt)}</dd>
          </div>
        ) : a.deadline ? (
          <div>
            <dt className="text-ink-3">{t.deadline}</dt>
            <dd className="font-semibold text-ink">{dateIn(lang, a.deadline)}</dd>
          </div>
        ) : null}
        {a.documentsNeeded > 0 && (
          <div>
            <dt className="text-ink-3">{t.documents}</dt>
            <dd className="font-semibold text-ink tnum">
              {Math.min(a.documentsReady, a.documentsNeeded)} / {a.documentsNeeded}
            </dd>
          </div>
        )}
        {a.interviewAt && (
          <div>
            <dt className="text-ink-3">{t.interview}</dt>
            <dd className="font-semibold text-ink">{dateIn(lang, a.interviewAt)}</dd>
          </div>
        )}
        {(a.visaApplied || a.visaApproved != null) && (
          <div>
            <dt className="text-ink-3">{t.visa}</dt>
            <dd className="font-semibold text-ink">
              {a.visaApproved === true ? t.visaApproved : a.visaApproved === false ? t.visaRefused : t.visaPending}
            </dd>
          </div>
        )}
      </dl>
    </li>
  );
}

function DocumentCard({
  doc,
  token,
  t,
  lang,
}: {
  doc: PortalData["documents"][number];
  token: string;
  t: Strings;
  lang: Lang;
}): React.ReactElement {
  const upload = useUploadToPortal(token);
  const input = useRef<HTMLInputElement>(null);
  const open = doc.status === "requested" || doc.status === "rejected";

  async function onFile(file: File | undefined): Promise<void> {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error(t.fileHint);
      return;
    }
    try {
      await upload.mutateAsync({ docId: doc._id, file });
      toast.success(t.uploaded(doc.title));
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, t.fileHint));
    } finally {
      if (input.current) input.current.value = "";
    }
  }

  const badge =
    doc.status === "accepted" ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-moss-soft px-2.5 py-0.5 text-xs font-semibold text-moss">
        <Check className="size-3.5" />
        {t.accepted}
      </span>
    ) : doc.status === "uploaded" ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-sea-soft px-2.5 py-0.5 text-xs font-semibold text-sea">
        <Clock className="size-3.5" />
        {t.waiting}
      </span>
    ) : doc.status === "rejected" ? (
      <span className="inline-flex items-center gap-1 rounded-full bg-stamp-soft px-2.5 py-0.5 text-xs font-semibold text-stamp">
        <TriangleAlert className="size-3.5" />
        {t.sentBack}
      </span>
    ) : (
      <span className="rounded-full bg-ochre-soft px-2.5 py-0.5 text-xs font-semibold text-ochre">{t.requested}</span>
    );

  return (
    <li className={cn("p-5", open ? "card" : "card-soft")}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-[15px] font-bold text-ink">{doc.title}</p>
        {badge}
      </div>
      {doc.note && <p className="mt-1 text-[13.5px] text-ink-2">{doc.note}</p>}
      {doc.status === "rejected" && doc.rejectReason && (
        <p className="mt-2 rounded-xl bg-stamp-soft px-3 py-2 text-[13.5px] text-stamp">{doc.rejectReason}</p>
      )}
      {open && doc.dueDate && <p className="mt-1 text-[13px] font-medium text-ochre">{t.neededBy(dateIn(lang, doc.dueDate))}</p>}
      {doc.file && (
        <a href={portalFileUrl(token, doc._id)} className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-2 hover:text-ink">
          <Download className="size-3.5" />
          {doc.file.originalName}
        </a>
      )}
      {doc.status !== "accepted" && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <input
            ref={input}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className="sr-only"
            id={`file-${doc._id}`}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <Button
            variant={open ? "primary" : "outline"}
            size={open ? "default" : "sm"}
            onClick={() => input.current?.click()}
            disabled={upload.isPending}
          >
            {upload.isPending ? <Loader2 className="animate-spin" /> : <FileUp />}
            {upload.isPending ? t.uploading : open ? t.upload : t.replace}
          </Button>
          {open && <span className="text-xs text-ink-3">{t.fileHint}</span>}
        </div>
      )}
    </li>
  );
}

export default function Portal(): React.ReactElement {
  const { token = "" } = useParams<{ token: string }>();
  const { data, isLoading, isError } = usePortal(token);
  const [lang, setLangState] = useState<Lang>(readLang);
  const t = T[lang];

  function setLang(next: Lang): void {
    setLangState(next);
    try {
      localStorage.setItem("suhayl-portal-lang", next);
    } catch {
      // The page still works; the choice just isn't remembered
    }
  }

  const header = (
    <div className="mb-8 flex items-center justify-between gap-4">
      <Wordmark className="text-[15px]" />
      <div className="flex rounded-full bg-paper-sunken p-1 text-[13px] font-semibold" role="group" aria-label="Langue / Language">
        {(["fr", "en"] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            className={cn("rounded-full px-3 py-1 transition-colors", lang === l ? "bg-paper-raised text-ink shadow-sm" : "text-ink-3 hover:text-ink")}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );

  const shell = (children: React.ReactNode): React.ReactElement => (
    <div className="min-h-screen bg-paper px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-2xl">
        {header}
        {children}
      </div>
    </div>
  );

  if (isLoading) {
    return shell(
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40 w-full rounded-3xl" />
        <Skeleton className="h-40 w-full rounded-3xl" />
      </div>,
    );
  }

  if (isError || !data) {
    return shell(
      <div className="card-soft px-6 py-10 text-center">
        <h1 className="text-2xl font-bold tracking-[-0.02em]">{t.gone}</h1>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-ink-2">{t.goneText}</p>
      </div>,
    );
  }

  const todo = data.documents.filter((d) => d.status === "requested" || d.status === "rejected");
  const done = data.documents.filter((d) => d.status === "uploaded" || d.status === "accepted");

  return shell(
    <>
      <header>
        <h1 className="text-[28px] leading-tight font-bold tracking-[-0.025em] sm:text-[34px]">{t.fileOf(data.student.name)}</h1>
        {data.agency && <p className="mt-1 text-[15px] text-ink-3">{t.followedBy(data.agency.name)}</p>}
      </header>

      <section className="mt-8">
        <h2 className="mb-3 flex items-center gap-2 text-[17px] font-bold">
          {t.todo}
          {todo.length > 0 && <span className="rounded-full bg-stamp px-2 py-0.5 text-xs font-bold text-white tnum">{todo.length}</span>}
        </h2>
        {todo.length === 0 ? (
          <p className="card-soft flex items-center gap-2 px-5 py-4 text-sm text-ink-2">
            <Check className="size-4 text-moss" />
            {t.todoNone}
          </p>
        ) : (
          <ul className="space-y-3">
            {todo.map((d) => (
              <DocumentCard key={d._id} doc={d} token={token} t={t} lang={lang} />
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="mb-3 text-[17px] font-bold">{t.applications}</h2>
        {data.applications.length === 0 ? (
          <p className="card-soft px-5 py-4 text-sm text-ink-2">{t.noApplications}</p>
        ) : (
          <ul className="space-y-3">
            {data.applications.map((a) => (
              <ApplicationCard key={a._id} a={a} t={t} lang={lang} />
            ))}
          </ul>
        )}
      </section>

      {done.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-[17px] font-bold">{t.sent}</h2>
          <ul className="space-y-3">
            {done.map((d) => (
              <DocumentCard key={d._id} doc={d} token={token} t={t} lang={lang} />
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-12 space-y-3 border-t border-rule pt-6 text-[13px] text-ink-3">
        {data.agency?.email && (
          <p>
            {t.contact} <span className="font-semibold text-ink-2 select-all">{data.agency.email}</span>
          </p>
        )}
        <p className="flex items-center gap-1.5">
          <ShieldCheck className="size-4 text-moss" />
          {t.privacy}
        </p>
      </footer>
    </>,
  );
}
