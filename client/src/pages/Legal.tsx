import { Link } from "react-router-dom";
import { Wordmark } from "@/components/kit";

/*
 * Privacy policy and terms. These are working drafts written for how Suhayl
 * actually handles data; have them reviewed by a lawyer before launch.
 */

const CONTACT = "privacy@suhayl.online";
const UPDATED = "23 October 2026";

function Shell({ title, children }: { title: string; children: React.ReactNode }): React.ReactElement {
  return (
    <div className="min-h-screen bg-paper px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 flex items-center justify-between">
          <Link to="/">
            <Wordmark className="text-[15px]" />
          </Link>
          <nav className="flex gap-4 text-[13px] font-semibold text-ink-3">
            <Link to="/privacy" className="hover:text-ink">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-ink">
              Terms
            </Link>
          </nav>
        </div>
        <p className="mb-6 rounded-2xl bg-ochre-soft px-4 py-3 text-[13px] text-ochre">
          Draft, last updated {UPDATED}. This text describes how Suhayl works today and must be reviewed by a lawyer before
          it applies.
        </p>
        <h1 className="text-[30px] leading-tight font-bold tracking-[-0.02em]">{title}</h1>
        <div className="legal mt-6 space-y-6 text-[15px] leading-relaxed text-ink-2 [&_h2]:mt-8 [&_h2]:text-[17px] [&_h2]:font-bold [&_h2]:text-ink [&_li]:mt-1.5 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Privacy(): React.ReactElement {
  return (
    <Shell title="Privacy policy">
      <p>
        Suhayl helps students and study-abroad agencies organise applications. This page explains what we keep, why, who can
        see it and how to remove it. Write to <span className="font-semibold text-ink select-all">{CONTACT}</span> with any
        question.
      </p>

      <h2>What we keep</h2>
      <ul>
        <li>Your account: name, email, a hashed password (we never store it readable), and whether you're a student, an agency owner or a counsellor.</li>
        <li>What you add: applications, checklists, statements, deadlines, notes, saved programs, reviews and your academic profile (GPA, IELTS, budget, countries).</li>
        <li>For agencies: the student files you create, follow-ups, payments recorded, and a history of who changed what.</li>
        <li>Documents families upload through a private link, such as transcripts, passports and test results.</li>
        <li>Letters written by recommenders through their private link.</li>
        <li>Technical records needed to run the service: error reports and request counts used to block abuse.</li>
      </ul>

      <h2>Why</h2>
      <p>
        Only to provide the service you asked for: tracking applications, sharing documents between a family and their agency,
        sending reminders, and keeping accounts secure. We don't sell personal data and we don't use it for advertising.
      </p>

      <h2>Who can see it</h2>
      <ul>
        <li>A student's own applications are visible to that student only.</li>
        <li>An agency's student files are visible to the agency owner and the counsellors they invite.</li>
        <li>Anyone holding a family link can see that student's progress and upload documents. Links expire, and the agency can turn them off at any time.</li>
        <li>Recommenders see only the student's name and program, never their documents.</li>
        <li>Service providers we rely on to run Suhayl (hosting, database, file storage, email, error tracking) process data on our behalf.</li>
      </ul>

      <h2>Where it's stored</h2>
      <p>
        Data is stored with our hosting and storage providers, which may be outside Algeria. We use encrypted connections
        (HTTPS) for everything sent to and from Suhayl.
      </p>

      <h2>How long</h2>
      <p>
        We keep your data while your account exists. Deleting your account from Settings removes your applications, files,
        letters and history straight away. When an agency deletes a student file, that student's applications and documents
        are deleted with it. Backups are overwritten within 30 days.
      </p>

      <h2>Your rights</h2>
      <p>
        You can see and correct your data in the app, download application data as a calendar or spreadsheet, and delete your
        account at any time. For anything else, such as a copy of everything we hold, write to us. Algerian residents are
        protected by Law 18-07 of 10 June 2018 on personal data, and EU residents by the GDPR; you may also contact your data
        protection authority.
      </p>

      <h2>Browser storage</h2>
      <p>
        We keep your sign-in and a few preferences (theme, language) in your browser. We don't use advertising or tracking
        cookies.
      </p>
    </Shell>
  );
}

export function Terms(): React.ReactElement {
  return (
    <Shell title="Terms of use">
      <p>By creating an account or using a private link you agree to these terms.</p>

      <h2>What Suhayl is</h2>
      <p>
        A tool for organising study-abroad applications. Suhayl is not a university, a visa office, Campus France or an agency,
        and it doesn't submit applications for you. Program details, deadlines and visa rules may be incomplete or out of date:
        always confirm them with the institution or the official body before relying on them.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Keep your password private. You're responsible for what happens under your account.</li>
        <li>Agency owners are responsible for the counsellors they invite and can remove them at any time.</li>
        <li>Don't use Suhayl for anything unlawful, and don't upload documents that aren't yours to share.</li>
      </ul>

      <h2>Agencies</h2>
      <p>
        If you add students to Suhayl, you confirm that they (or their parents, for minors) agreed to you storing their
        information and documents here, and you handle their data according to the privacy policy and the law. You decide
        who receives each family link.
      </p>

      <h2>Families and recommenders</h2>
      <p>
        Uploading a document through a family link, or writing a letter through a recommender link, shares it with the agency
        or student who sent you the link.
      </p>

      <h2>Availability and liability</h2>
      <p>
        We work to keep Suhayl available and your data safe, but we can't promise the service will never be interrupted.
        Keep your own copies of important documents. To the extent the law allows, Suhayl isn't liable for a missed deadline
        or a decision made by an institution or a consulate.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. If a change matters, we'll tell you in the app before it applies. Questions:{" "}
        <span className="font-semibold text-ink select-all">{CONTACT}</span>.
      </p>
    </Shell>
  );
}
